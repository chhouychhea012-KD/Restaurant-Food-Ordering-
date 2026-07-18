import { describe, expect, it } from 'vitest';
import router from '@/router';

describe('router namespaces', () => {
  it('registers the required milestone-zero route namespaces', () => {
    const paths = router.getRoutes().map((route) => route.path);

    expect(paths).toContain('/');
    expect(paths).toContain('/auth');
    expect(paths).toContain('/customer');
    expect(paths).toContain('/admin');
    expect(paths).toContain('/partner');
    expect(paths).toContain('/kitchen');
    expect(paths).toContain('/rider');
    expect(paths).toContain('/forbidden');
    expect(paths).toContain('/not-found');
  });
});
