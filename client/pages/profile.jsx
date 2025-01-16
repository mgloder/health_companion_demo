import { Link } from 'react-router-dom';
import { ChevronLeft, Shield, CreditCard, Users, FileText, Settings, HelpCircle } from 'react-feather';
import insuranceIcon from '../assets/sheild-icon.svg';
import marryProfile from '../assets/marry-profile.svg';
import creditCardIcon from '../assets/credit-card-icon.svg';
import exerciseFriendsIcon from '../assets/friends-icon.svg';
import bagIcon from '../assets/bag-icon.svg';
import settingIcon from '../assets/setting-icon.svg';
import linerShape from '../assets/liner-shape.svg';

export default function Profile() {
  return (
    <div className="p-4 bg-gray-50 min-h-screen relative">
      <div 
        className="absolute left-0 right-0 top-[80px] min-h-screen rounded-t-[53px] bg-gradient-to-b from-[#F4F5FF] to-[#B1C6F40A]" 
        style={{ zIndex: 'auto' }}
      />
        <div className="flex items-center mt-[10px]">
          <Link to="/" className="text-gray-600 mt-2">
            <ChevronLeft size={28} />
          </Link>
        </div>

        {/* Profile Info */}
        <div className="flex items-center justify-between mb-8 relative ml-[20px]">
          <div className="flex items-center">
            <div className="relative flex items-center justify-center mr-6">
              <img 
                src={marryProfile} 
                alt="Profile" 
                className="w-35 h-35 rounded-full border-4"
              />
              <div className="absolute inset-0 rounded-full border-2 border-[#F4F5FF]"></div>
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-blue-500">Marry</h1>
              <p className="text-blue-500">2354561847@gmail.com</p>
            </div>
          </div>
        </div>

        {/* Balance Card */}
        <div className="bg-black text-white rounded-2xl p-6 mb-8 relative overflow-hidden">
          <div className="absolute right-0 top-0 p-2">
            <HelpCircle size={20} className="text-gray-300" />
          </div>
          <img 
            src={linerShape} 
            className="absolute right-0 top-0 h-full w-[120%] z-0"
            style={{ objectFit: 'cover' }}
          />
          <h2 className="text-gray-300 mb-2 text-[16px]">Balance</h2>
          <div className="text-4xl font-bold mb-4 text-[40px] mt-[10px]">769.00 <span className="text-xl">mbc</span></div>
          <div className="flex gap-4 justify-end">
            <button className="border border-gray-600 rounded-full px-6 py-2 text-sm font-medium">History</button>
            <button className="bg-gradient-to-r from-[#6485FA] to-[#9DB2FF] rounded-full px-6 py-2 text-sm font-medium">Withdraw</button>
          </div>
        </div>

        {/* Menu Items */}
        <div className="space-y-4 relative">
          <Link to="/insurance" className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#3660F9] to-[#809BFF] flex items-center justify-center">
                <img src={insuranceIcon} alt="Insurance" className="w-6 h-6 rounded-full" />
              </div>
              <span className="font-medium text-blue-500 text-lg">Insurance</span>
            </div>
            <ChevronLeft className="rotate-180 text-blue-500" size={28} />
          </Link>

          <Link to="/credit-card" className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm">
          <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#3660F9] to-[#809BFF] flex items-center justify-center">
                <img src={creditCardIcon} alt="Insurance" className="w-6 h-6 rounded-full" />
              </div>
              <span className="font-medium text-blue-500 text-lg">Credit card</span>
            </div>
            <ChevronLeft className="rotate-180 text-blue-500" size={28} />
          </Link>

          <Link to="/exercise-friends" className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm">
            <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#3660F9] to-[#809BFF] flex items-center justify-center">
                <img src={exerciseFriendsIcon} alt="Insurance" className="w-6 h-6 rounded-full" />
              </div>
              <span className="font-medium text-blue-500 text-lg">Exercise friends</span>
            </div>
            <div className="flex items-center">
              <span className="text-blue-500 mr-2 font-medium">NO.<span className="text-xl font-bold">5</span></span>
              <ChevronLeft className="rotate-180 text-blue-500" size={28} />
            </div>
          </Link>

          <Link to="/orders" className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm">
          <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#3660F9] to-[#809BFF] flex items-center justify-center">
                <img src={bagIcon} alt="Insurance" className="w-6 h-6 rounded-full" />
              </div>
              <span className="font-medium text-blue-500 text-lg">My orders</span>
            </div>
            <ChevronLeft className="rotate-180 text-blue-500" size={28} />
          </Link>

          <Link to="/settings" className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm">
          <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#3660F9] to-[#809BFF] flex items-center justify-center">
                <img src={settingIcon} alt="Insurance" className="w-6 h-6 rounded-full" />
              </div>
              <span className="font-medium text-blue-500 text-lg">Setting</span>
            </div>
            <ChevronLeft className="rotate-180 text-blue-500" size={28} />
          </Link>
        </div>
    </div>
  );
}
