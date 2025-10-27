
import React from 'react';

interface InfoCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

const InfoCard: React.FC<InfoCardProps> = ({ icon, label, value }) => {
  return (
    <div className="bg-white/10 p-4 rounded-xl flex flex-col items-center justify-center text-center">
      <div className="text-white/80 mb-1">{icon}</div>
      <p className="text-sm text-white/80">{label}</p>
      <p className="text-lg font-bold">{value}</p>
    </div>
  );
};

export default InfoCard;
