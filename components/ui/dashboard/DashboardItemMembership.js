import { useEffect, useState } from 'react';

/**
 * 会员
 * @returns
 */
export default function DashboardItemMembership() {
  const [selectedMembership, setSelectedMembership] = useState(null);
  const [amount, setAmount] = useState(0);

  const memberships = [
  {
    title: "\u5E74\u4F1A\u54E1",
    points: 98,
    duration: "365\u65E5",
    benefits: [
    "\u6BCE\u65E55\u301C20\u4EF6\u306E\u4EBA\u6C17\u30D7\u30ED\u30B8\u30A7\u30AF\u30C8\u3092\u66F4\u65B0",
    "\u5168\u30B5\u30A4\u30C8\u306E\u30EA\u30BD\u30FC\u30B9\u3092\u7121\u6599\u3067\u5165\u624B",
    "\u5185\u90E8\u30E1\u30F3\u30D0\u30FC\u5C02\u7528\u30C1\u30E3\u30C3\u30C8\u30B0\u30EB\u30FC\u30D7",
    "\u5DEE\u984D\u3092\u652F\u6255\u3063\u3066\u30A2\u30C3\u30D7\u30B0\u30EC\u30FC\u30C9\u53EF\u80FD",
    "\u30D7\u30ED\u30E2\u30FC\u30B7\u30E7\u30F3\u5831\u916C\u306F\u6700\u592740\uFF05\u3067\u3059\u3002"]

  },
  {
    title: "\u6C38\u4E45\u4F1A\u54E1",
    points: 138,
    duration: "\u6C38\u9060",
    benefits: [
    "\u6BCE\u65E55\u301C20\u4EF6\u306E\u4EBA\u6C17\u30D7\u30ED\u30B8\u30A7\u30AF\u30C8\u3092\u66F4\u65B0",
    "\u5168\u30B5\u30A4\u30C8\u306E\u30EA\u30BD\u30FC\u30B9\u3092\u7121\u6599\u3067\u5165\u624B",
    "\u5185\u90E8\u30E1\u30F3\u30D0\u30FC\u5C02\u7528\u30C1\u30E3\u30C3\u30C8\u30B0\u30EB\u30FC\u30D7",
    "\u5DEE\u984D\u3092\u652F\u6255\u3063\u3066\u30A2\u30C3\u30D7\u30B0\u30EC\u30FC\u30C9\u53EF\u80FD",
    "\u30D7\u30ED\u30E2\u30FC\u30B7\u30E7\u30F3\u5831\u916C\u306F\u6700\u592770\uFF05\u3067\u3059\u3002"]

  },
  {
    title: "\u904B\u55B6\u8005\u30C8\u30EC\u30FC\u30CB\u30F3\u30B0\u30AD\u30E3\u30F3\u30D7",
    points: 1998,
    duration: "\u6C38\u9060",
    benefits: [
    "\u30B5\u30A4\u30C8\u7BA1\u7406\u8005\u306E\u5B66\u54E1\u306F\u3001\u30A2\u30B7\u30B9\u30BF\u30F3\u30C8\u306B\u9023\u7D61\u3057\u3066\u9023\u643A\u3057\u3066\u304F\u3060\u3055\u3044\u3002",
    "1\u5BFE1\u30B5\u30DD\u30FC\u30C8\u3067\u30A6\u30A7\u30D6\u30B5\u30A4\u30C8\u69CB\u7BC9",
    "\u72EC\u81EA\u306E\u96C6\u5BA2\u6280\u8853\u3092\u63D0\u4F9B\u3057\u3001\u305D\u308C\u306B\u5F93\u3048\u3070\u6210\u529F\u3067\u304D\u307E\u3059\u3002",
    "\u5168\u30B5\u30A4\u30C8\u306E\u7D20\u6750\u3092\u76F4\u63A5\u5B66\u54E1\u306E\u65B0\u3057\u3044\u30B5\u30A4\u30C8\u306B\u8907\u88FD\u3059\u308B",
    "\u30BD\u30D5\u30C8\u30A6\u30A7\u30A2\u306E\u30EF\u30F3\u30AF\u30EA\u30C3\u30AF\u540C\u671F\u66F4\u65B0",
    "\u53D7\u8B1B\u8005\u5C02\u7528\u30B3\u30DF\u30E5\u30CB\u30C6\u30A3\u304A\u3088\u3073\u30C1\u30E3\u30C3\u30C8\u30B0\u30EB\u30FC\u30D7",
    "\u9AD8\u984D\u306A\u798F\u5229\u3092\u63D0\u4F9B\u3059\u308B\u6253\u523B\u30E1\u30AB\u30CB\u30BA\u30E0\u3092\u8A2D\u7ACB\u3059\u308B\uFF08\u5B66\u7FD2\u8005\u306E\u5B9F\u884C\u529B\u3092\u5F37\u5316\u3059\u308B\uFF09"]

  }];


  const handleMembershipSelect = (index) => {
    setSelectedMembership(index);
    setAmount(memberships[index].points);
  };

  const handleAmountChange = (e) => {
    const value = e.target.value;
    setAmount(value);
  };

  useEffect(() => {
    if (selectedMembership !== null) {
      // 如果用户选中了会员，自动更新支付金额
      const selectedPoints = memberships[selectedMembership]?.points;
      if (selectedPoints) {
        setAmount(selectedPoints);
      }
    }
  }, [selectedMembership]);

  return (
    <div className='bg-white rounded-lg shadow-lg p-6 border'>
      <div>
        <h2 className='text-2xl font-bold mb-4'>会员注册</h2>
        <hr className='my-2' />
      </div>

      {/* 会员卡片 */}
      <div className='grid grid-cols-3 gap-4'>
        {memberships.map((membership, index) =>
        <div
          key={index}
          className={`block max-w-sm p-6 text-center border cursor-pointer rounded-lg shadow ${
          selectedMembership === index ? 'bg-blue-100' : 'bg-gray-50'}`
          }
          onClick={() => handleMembershipSelect(index)}>
            <h5 className='mb-2 text-2xl font-bold tracking-tight'>
              {membership.title}
            </h5>
            <p className='font-normal'>所需积分：{membership.points} 积分</p>
            <p className='font-normal'>会员时长：{membership.duration}</p>
            <ul className='text-gray-600 mt-2'>
              {membership.benefits.map((benefit, i) =>
            <li key={i}>{benefit}</li>
            )}
            </ul>
          </div>
        )}
      </div>

      <form className='mt-6'>
        <div className='flex justify-between w-full mb-4'>
          <div>
            支付金额：<span className='text-red-500'>￥{amount}</span>
          </div>
          <button
            type='submit'
            className='text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800'>
            立即开通
          </button>
        </div>

        <ul className='text-gray-600 list-disc pl-6'>
          <li>开通会员说明：</li>
          <li className='font-bold'>这只是一个演示页面，不存在真实功能！</li>
          <li>本站会员账号权限为虚拟数字资源，开通后不可退款</li>
          <li>开通会员后可享有对应会员特权的商品折扣，免费权限</li>
          <li>会员特权到期后不享受特权</li>
          <li>重复购买特权到期时间累计增加</li>
        </ul>
      </form>
    </div>);

}