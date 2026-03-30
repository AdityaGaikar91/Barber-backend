<<<<<<< HEAD
import { Test, TestingModule } from '@nestjs/testing';
import { AppointmentsService } from './appointments.service';

describe('AppointmentsService', () => {
  let service: AppointmentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AppointmentsService],
    }).compile();

    service = module.get<AppointmentsService>(AppointmentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
=======
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';

// Mock the db module
jest.mock('../db', () => {
  const mockTransaction = jest.fn();
  return {
    db: {
      query: {
        tenants: { findFirst: jest.fn() },
        services: { findMany: jest.fn() },
        appointments: { findFirst: jest.fn(), findMany: jest.fn() },
      },
      select: jest.fn().mockReturnThis(),
      from: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      innerJoin: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      values: jest.fn().mockReturnThis(),
      returning: jest.fn(),
      update: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
      transaction: mockTransaction,
    },
  };
});

import { db } from '../db';

describe('AppointmentsService', () => {
  let service: AppointmentsService;

  const mockTenant = {
    id: 'tenant-1',
    name: 'Test Barbershop',
    slug: 'test-barbershop',
    logoUrl: null,
  };

  const mockService = {
    id: 'service-1',
    tenantId: 'tenant-1',
    name: 'Haircut',
    duration: 30,
    price: 25,
    isActive: true,
  };

  beforeEach(() => {
    service = new AppointmentsService();
    jest.clearAllMocks();
  });

  describe('getPublicBookingInfo', () => {
    it('should return shop info, services, and employees', async () => {
      (db.query.tenants.findFirst as jest.Mock).mockResolvedValue(mockTenant);
      (db.query.services.findMany as jest.Mock).mockResolvedValue([
        mockService,
      ]);

      // Mock the employees join query
      const mockInnerJoin = jest.fn().mockReturnValue({
        where: jest
          .fn()
          .mockResolvedValue([
            { id: 'emp-1', bio: 'Expert barber', name: 'John' },
          ]),
      });
      const mockFrom = jest.fn().mockReturnValue({ innerJoin: mockInnerJoin });
      (db.select as jest.Mock).mockReturnValue({ from: mockFrom });

      const result = await service.getPublicBookingInfo('test-barbershop');

      expect(result.shopName).toBe('Test Barbershop');
      expect(result.services).toHaveLength(1);
      expect(result.employees).toHaveLength(1);
    });

    it('should throw NotFoundException for unknown slug', async () => {
      (db.query.tenants.findFirst as jest.Mock).mockResolvedValue(undefined);

      await expect(service.getPublicBookingInfo('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('createAppointment', () => {
    const validDto = {
      tenantSlug: 'test-barbershop',
      serviceIds: ['service-1'],
      employeeId: 'emp-1',
      appointmentTime: new Date('2026-04-01T10:00:00Z').toISOString(),
      customerName: 'Jane Doe',
      customerPhone: '1234567890',
    };

    it('should successfully create an appointment when no conflicts exist', async () => {
      (db.query.tenants.findFirst as jest.Mock).mockResolvedValue(mockTenant);
      (db.query.services.findMany as jest.Mock).mockResolvedValue([
        mockService,
      ]);

      // Mock customer lookup — no existing customer
      const mockCustomerWhere = jest.fn().mockResolvedValue([]);
      const mockCustomerFrom = jest
        .fn()
        .mockReturnValue({ where: mockCustomerWhere });
      (db.select as jest.Mock).mockReturnValue({ from: mockCustomerFrom });

      // Mock customer insert
      const mockCustomerReturning = jest
        .fn()
        .mockResolvedValue([{ id: 'cust-1' }]);
      const mockCustomerValues = jest
        .fn()
        .mockReturnValue({ returning: mockCustomerReturning });
      (db.insert as jest.Mock).mockReturnValue({ values: mockCustomerValues });

      // Mock transaction — execute the callback directly
      const mockAppointment = {
        id: 'appt-1',
        tenantId: 'tenant-1',
        status: 'PENDING',
      };

      (db.transaction as jest.Mock).mockImplementation((callback: any) => {
        const tx = {
          select: jest.fn().mockReturnValue({
            from: jest.fn().mockReturnValue({
              where: jest.fn().mockResolvedValue([]), // no conflicts
            }),
          }),
          insert: jest.fn().mockReturnValue({
            values: jest.fn().mockReturnValue({
              returning: jest.fn().mockResolvedValue([mockAppointment]),
            }),
          }),
        };
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
        return callback(tx);
      });

      const result = await service.createAppointment(validDto);

      expect(result).toEqual([mockAppointment]);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(db.transaction).toHaveBeenCalled();
    });

    it('should throw BadRequestException when time slot has conflicts', async () => {
      (db.query.tenants.findFirst as jest.Mock).mockResolvedValue(mockTenant);
      (db.query.services.findMany as jest.Mock).mockResolvedValue([
        mockService,
      ]);

      // No customer phone — skip customer logic
      const dtoNoPhone = { ...validDto, customerPhone: undefined };

      // Mock transaction with conflict

      (db.transaction as jest.Mock).mockImplementation((callback: any) => {
        const tx = {
          select: jest.fn().mockReturnValue({
            from: jest.fn().mockReturnValue({
              where: jest.fn().mockResolvedValue([{ id: 'existing-appt' }]), // conflict found
            }),
          }),
        };
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
        return callback(tx);
      });

      await expect(service.createAppointment(dtoNoPhone)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException when tenant slug is invalid', async () => {
      (db.query.tenants.findFirst as jest.Mock).mockResolvedValue(undefined);

      await expect(
        service.createAppointment({ ...validDto, tenantSlug: 'bad-slug' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when service ID is invalid', async () => {
      (db.query.tenants.findFirst as jest.Mock).mockResolvedValue(mockTenant);
      (db.query.services.findMany as jest.Mock).mockResolvedValue([]); // no services found

      await expect(service.createAppointment(validDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateAppointmentStatus', () => {
    it('should update and return the appointment', async () => {
      const mockAppt = {
        id: 'appt-1',
        tenantId: 'tenant-1',
        status: 'PENDING',
      };
      (db.query.appointments.findFirst as jest.Mock).mockResolvedValue(
        mockAppt,
      );

      const mockReturning = jest
        .fn()
        .mockResolvedValue([{ ...mockAppt, status: 'APPROVED' }]);
      const mockWhere = jest.fn().mockReturnValue({ returning: mockReturning });
      const mockSet = jest.fn().mockReturnValue({ where: mockWhere });
      (db.update as jest.Mock).mockReturnValue({ set: mockSet });

      const result = await service.updateAppointmentStatus(
        'tenant-1',
        'appt-1',
        'APPROVED',
      );

      expect(result.status).toBe('APPROVED');
    });

    it('should throw NotFoundException for invalid appointment', async () => {
      (db.query.appointments.findFirst as jest.Mock).mockResolvedValue(
        undefined,
      );

      await expect(
        service.updateAppointmentStatus('tenant-1', 'nonexistent', 'CANCELLED'),
      ).rejects.toThrow(NotFoundException);
    });
>>>>>>> development
  });
});
