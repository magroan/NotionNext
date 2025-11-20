import SmartLink from '@/components/SmartLink';

/**
 * 仪表盘菜单
 * @returns
 */
import { useRouter } from 'next/router';

/**
 * 仪表盘菜单
 * @returns
 */
export default function DashboardMenuList() {
  const { asPath } = useRouter(); // 获取当前路径
  const dashBoardMenus = [
  { title: "\u30C0\u30C3\u30B7\u30E5\u30DC\u30FC\u30C9", icon: 'fas fa-gauge', href: '/dashboard' },
  { title: "\u57FA\u672C\u60C5\u5831", icon: 'fas fa-user', href: '/dashboard/user-profile' },
  { title: "\u79C1\u306E\u6B8B\u9AD8", icon: 'fas fa-coins', href: '/dashboard/balance' },
  { title: "\u30DE\u30A4\u30E1\u30F3\u30D0\u30FC", icon: 'fas fa-gem', href: '/dashboard/membership' },
  {
    title: "\u79C1\u306E\u6CE8\u6587",
    icon: 'fas fa-cart-shopping',
    href: '/dashboard/order'
  },
  {
    title: "\u30D7\u30ED\u30E2\u30FC\u30B7\u30E7\u30F3\u30BB\u30F3\u30BF\u30FC",
    icon: 'fas fa-hand-holding-usd',
    href: '/dashboard/affiliate'
  }];


  return (
    <ul
      role='menu'
      className='side-tabs-list bg-white border rounded-lg shadow-lg p-2 space-y-2 mb-6'>
      {dashBoardMenus.map((item, index) => {
        // 判断当前菜单是否高亮
        const isActive = asPath === item.href;
        return (
          <li
            role='menuitem'
            key={index}
            className={`rounded-lg cursor-pointer block ${
            isActive ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`
            }>
            <SmartLink
              href={item.href}
              className='block py-2 px-4 w-full items-center justify-center'>
              <i className={`${item.icon} w-6 mr-2`}></i>
              <span className='whitespace-nowrap'>{item.title}</span>
            </SmartLink>
          </li>);

      })}
    </ul>);

}