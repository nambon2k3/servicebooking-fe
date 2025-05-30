import { MenuItem } from '../models/menu.model';

export class Menu {
  public static pages: MenuItem[] = [
    {
      group: 'Nhà cung cấp',
      separator: true,
      items: [
        {
          icon: 'assets/icons/heroicons/outline/chart-pie.svg',
          label: 'Yêu cầu Dịch vụ', route: '/service-provider/service-request'
        },
      ],
    }, {
      group: 'Bán hàng',
      separator: true,
      items: [
        {
          icon: 'assets/icons/heroicons/outline/cart.svg',
          label: 'Tour',
          route: '/salesman',
          children: [
            { label: 'Danh sách booking', route: '/salesman/list-booking' },
            { label: 'Tour mở bán (SIC)', route: '/salesman/list-tour-public' },
            { label: 'Tour đặt riêng', route: '/salesman/list-tour-private' },
          ],
        },
        {
          icon: 'assets/icons/heroicons/outline/cart.svg',
          label: 'Yêu Cầu Tạo Tour',
          children: [
            { label: 'Danh sách', route: '/salesman/list-plan' }
          ],
        }
      ],
    },
    {
      group: 'Điều hành',
      separator: true,
      items: [
        {
          icon: 'assets/icons/heroicons/outline/travel-bag-svgrepo-com.svg',
          label: 'Điều hành Tour',
          children: [
            {
              label: 'Tour SIC',
              route: '/operator/view-list-tour',
            },
            {
              label: 'Tour đặt riêng',
              route: '/operator/view-list-tour-private',
            },
          ],
        },
        {
          icon: 'assets/icons/heroicons/outline/request-quote-svgrepo-com.svg',
          label: 'Xử lý yêu cầu',
          route: '/operator/view-list-request',
        }
      ],
    },
    {
      group: 'Marketing',
      separator: true,
      items: [
        {
          icon: 'assets/icons/heroicons/outline/marketing-svgrepo-com.svg',
          label: 'List Blog', route: '/marketer/blog'
        }
      ],
    },
    {
      group: 'Trưởng phòng kinh doanh',
      separator: true,
      items: [
        {
          icon: 'assets/icons/heroicons/outline/travel-bag-svgrepo-com.svg',
          label: 'Tour',
          route: '/head-business/list-tour'
        },
        {
          icon: 'assets/icons/heroicons/outline/location-pin-svgrepo-com.svg',
          label: 'Địa điểm',
          route: '/head-business/locations',
        },
        {
          icon: 'assets/icons/heroicons/outline/refund-2-svgrepo-com.svg',
          label: 'Yêu cầu hoàn tiền',
          route: '/head-business/tour-request',
        },
      ],
    },
    {
      group: 'Kế toán',
      separator: true,
      items: [
        {
          icon: 'assets/icons/heroicons/outline/bill.svg',
          label: 'Phiếu dịch vụ',
          children: [
            { label: 'Phiếu thu', route: '/accountant/list-receipt' },
            { label: 'Phiếu chi', route: '/accountant/list-payment' },
            { label: 'Phiếu hoàn tiền', route: '/accountant/list-refund' },
          ],
        },
        {
          icon: 'assets/icons/heroicons/outline/dollar-svgrepo-com.svg',
          label: 'Quyết toán tour',
          route: '/accountant/list-tour',
        }
      ],
    },
    {
      group: 'CEO',
      separator: true,
      items: [
        {
          icon: 'assets/icons/heroicons/outline/chart-pie.svg',
          label: 'Thống kê',
          route: '/ceo/dashboard',
        },
        {
          icon: 'assets/icons/heroicons/outline/travel-bag-svgrepo-com.svg',
          label: 'Duyệt Tour',
          route: '/ceo/tour-request',
        },
        {
          icon: 'assets/icons/heroicons/outline/product-svgrepo-com.svg',
          label: 'Nhà cung cấp',
          route: '/ceo/service-provider',
        }
      ],
    },
    {
      group: 'System',
      separator: true,
      items: [
        {
          icon: 'assets/icons/heroicons/outline/users.svg',
          label: 'Người dùng',
          children: [
            { label: 'Nhân viên', route: '/admin/user' },
            { label: 'Khách hàng', route: '/admin/customer' },
          ],
        },
        {
          icon: 'assets/icons/heroicons/outline/category-svgrepo-com.svg',
          label: 'Danh mục dịch vụ',
          route: '/admin/service-category',
        },
      ],
    },
  ];
}
