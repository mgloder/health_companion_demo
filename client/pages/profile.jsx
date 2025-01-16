import { Link } from 'react-router-dom';
import { ChevronLeft, Shield, CreditCard, Users, FileText, Settings, HelpCircle } from 'react-feather';
import marryProfile from '../assets/marry-profile.svg';

export default function Profile() {
  return (
    <div className="p-4 bg-gray-50 min-h-screen relative">
      {/* Header */}
      <div className="flex items-center mb-4">
        <Link to="/" className="text-gray-600">
          <ChevronLeft size={24} />
        </Link>
      </div>

      {/* Profile Info */}
      <div className="flex items-center mb-8">
        <img 
          src={marryProfile} 
          alt="Profile" 
          className="w-16 h-16 rounded-full mr-4"
        />
        <div>
          <h1 className="text-2xl font-semibold">Marry</h1>
          <p className="text-gray-500">2354561847@gmail.com</p>
        </div>
      </div>

      {/* Balance Card */}
      <div className="bg-black text-white rounded-2xl p-6 mb-8 relative overflow-hidden">
        <div className="absolute right-0 top-0 p-2">
          <HelpCircle size={20} className="text-gray-300" />
        </div>
        <h2 className="text-gray-300 mb-2">Balance</h2>
        <div className="text-4xl font-bold mb-4">769.00 <span className="text-xl">mbc</span></div>
        <div className="flex gap-4">
          <button className="border border-gray-600 rounded-full px-6 py-2 text-sm font-medium">History</button>
          <button className="bg-blue-500 rounded-full px-6 py-2 text-sm font-medium">Withdraw</button>
        </div>
      </div>

      {/* Menu Items */}
      <div className="space-y-4">
        <Link to="/insurance" className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm">
          <div className="flex items-center gap-4">
            <Shield className="text-blue-500" size={24} />
            <span className="font-medium">Insurance</span>
          </div>
          <ChevronLeft className="rotate-180" size={20} />
        </Link>

        <Link to="/credit-card" className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm">
          <div className="flex items-center gap-4">
            <CreditCard className="text-blue-500" size={24} />
            <span className="font-medium">Credit card</span>
          </div>
          <ChevronLeft className="rotate-180" size={20} />
        </Link>

        <Link to="/exercise-friends" className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm">
          <div className="flex items-center gap-4">
            <Users className="text-blue-500" size={24} />
            <span className="font-medium">Exercise friends</span>
          </div>
          <div className="flex items-center">
            <span className="text-blue-500 mr-2 font-medium">NO.5</span>
            <ChevronLeft className="rotate-180" size={20} />
          </div>
        </Link>

        <Link to="/orders" className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm">
          <div className="flex items-center gap-4">
            <FileText className="text-blue-500" size={24} />
            <span className="font-medium">My orders</span>
          </div>
          <ChevronLeft className="rotate-180" size={20} />
        </Link>

        <Link to="/settings" className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm">
          <div className="flex items-center gap-4">
            <Settings className="text-blue-500" size={24} />
            <span className="font-medium">Setting</span>
          </div>
          <ChevronLeft className="rotate-180" size={20} />
        </Link>
      </div>
    </div>
  );
}
