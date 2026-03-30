<<<<<<< HEAD
import { Test, TestingModule } from '@nestjs/testing';
import { SubscriptionsService } from './subscriptions.service';
=======
import { ForbiddenException } from '@nestjs/common';
import {
  SubscriptionsService,
  SubscriptionTier,
  TIER_LIMITS,
} from './subscriptions.service';

// Mock the db module
jest.mock('../db', () => ({
  db: {
    query: {
      tenants: {
        findFirst: jest.fn(),
      },
    },
    select: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
  },
}));

import { db } from '../db';
>>>>>>> development

describe('SubscriptionsService', () => {
  let service: SubscriptionsService;

<<<<<<< HEAD
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SubscriptionsService],
    }).compile();

    service = module.get<SubscriptionsService>(SubscriptionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
=======
  beforeEach(() => {
    service = new SubscriptionsService();
    jest.clearAllMocks();
  });

  describe('getTenantTier', () => {
    it('should return the tenant subscription tier', async () => {
      (db.query.tenants.findFirst as jest.Mock).mockResolvedValue({
        subscriptionTier: 'PRO',
      });

      const result = await service.getTenantTier('tenant-1');

      expect(result).toBe(SubscriptionTier.PRO);
    });

    it('should default to FREE when tenant has no tier', async () => {
      (db.query.tenants.findFirst as jest.Mock).mockResolvedValue({
        subscriptionTier: null,
      });

      const result = await service.getTenantTier('tenant-1');

      expect(result).toBe(SubscriptionTier.FREE);
    });

    it('should default to FREE when tenant is not found', async () => {
      (db.query.tenants.findFirst as jest.Mock).mockResolvedValue(undefined);

      const result = await service.getTenantTier('nonexistent');

      expect(result).toBe(SubscriptionTier.FREE);
    });
  });

  describe('checkEmployeeAvailability', () => {
    it('should pass when under the employee limit', async () => {
      (db.query.tenants.findFirst as jest.Mock).mockResolvedValue({
        subscriptionTier: 'FREE',
      });
      // Mock the chained select().from().where() to return count = 0
      const mockWhere = jest.fn().mockResolvedValue([{ value: 0 }]);
      const mockFrom = jest.fn().mockReturnValue({ where: mockWhere });
      const mockSelect = jest.fn().mockReturnValue({ from: mockFrom });
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      (db as any).select = mockSelect;

      const result = await service.checkEmployeeAvailability('tenant-1');

      expect(result).toBe(true);
    });

    it('should throw ForbiddenException when at employee limit', async () => {
      (db.query.tenants.findFirst as jest.Mock).mockResolvedValue({
        subscriptionTier: 'FREE',
      });
      const mockWhere = jest
        .fn()
        .mockResolvedValue([
          { value: TIER_LIMITS[SubscriptionTier.FREE].maxEmployees },
        ]);
      const mockFrom = jest.fn().mockReturnValue({ where: mockWhere });
      const mockSelect = jest.fn().mockReturnValue({ from: mockFrom });
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      (db as any).select = mockSelect;

      await expect(
        service.checkEmployeeAvailability('tenant-1'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should always pass for PRO tier (Infinity limit)', async () => {
      (db.query.tenants.findFirst as jest.Mock).mockResolvedValue({
        subscriptionTier: 'PRO',
      });

      const result = await service.checkEmployeeAvailability('tenant-1');

      expect(result).toBe(true);
    });
  });

  describe('checkTransactionAvailability', () => {
    it('should pass when under the monthly transaction limit', async () => {
      (db.query.tenants.findFirst as jest.Mock).mockResolvedValue({
        subscriptionTier: 'FREE',
      });
      const mockWhere = jest.fn().mockResolvedValue([{ value: 10 }]);
      const mockFrom = jest.fn().mockReturnValue({ where: mockWhere });
      const mockSelect = jest.fn().mockReturnValue({ from: mockFrom });
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      (db as any).select = mockSelect;

      const result = await service.checkTransactionAvailability('tenant-1');

      expect(result).toBe(true);
    });

    it('should throw ForbiddenException when at transaction limit', async () => {
      (db.query.tenants.findFirst as jest.Mock).mockResolvedValue({
        subscriptionTier: 'FREE',
      });
      const mockWhere = jest
        .fn()
        .mockResolvedValue([
          { value: TIER_LIMITS[SubscriptionTier.FREE].maxTransactionsPerMonth },
        ]);
      const mockFrom = jest.fn().mockReturnValue({ where: mockWhere });
      const mockSelect = jest.fn().mockReturnValue({ from: mockFrom });
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      (db as any).select = mockSelect;

      await expect(
        service.checkTransactionAvailability('tenant-1'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should always pass for ENTERPRISE tier', async () => {
      (db.query.tenants.findFirst as jest.Mock).mockResolvedValue({
        subscriptionTier: 'ENTERPRISE',
      });

      const result = await service.checkTransactionAvailability('tenant-1');

      expect(result).toBe(true);
    });
  });

  describe('isPro', () => {
    it('should return true for PRO tier', async () => {
      (db.query.tenants.findFirst as jest.Mock).mockResolvedValue({
        subscriptionTier: 'PRO',
      });

      expect(await service.isPro('tenant-1')).toBe(true);
    });

    it('should return true for ENTERPRISE tier', async () => {
      (db.query.tenants.findFirst as jest.Mock).mockResolvedValue({
        subscriptionTier: 'ENTERPRISE',
      });

      expect(await service.isPro('tenant-1')).toBe(true);
    });

    it('should return false for FREE tier', async () => {
      (db.query.tenants.findFirst as jest.Mock).mockResolvedValue({
        subscriptionTier: 'FREE',
      });

      expect(await service.isPro('tenant-1')).toBe(false);
    });
>>>>>>> development
  });
});
