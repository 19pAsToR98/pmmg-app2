import React from 'react';
import { Vehicle } from '../types';
import { getBrandData, getColorClass } from '../utils/vehicleData';

interface VehicleVisualsProps {
  vehicle: Vehicle;
  size?: 'sm' | 'md';
}

const VehicleVisuals: React.FC<VehicleVisualsProps> = ({ vehicle, size = 'md' }) => {
  const { svgUrl } = getBrandData(vehicle.model);
  const colorClass = getColorClass(vehicle.color);
  
  const logoSize = size === 'sm' ? 'w-5 h-5' : 'w-6 h-6';
  const colorDotSize = size === 'sm' ? 'w-3 h-3' : 'w-4 h-4';

  return (
    <div className="flex items-center gap-2 shrink-0">
      {/* Brand Logo */}
      <div className={`${logoSize} rounded-full overflow-hidden shadow-sm`}>
        <img src={svgUrl} alt="Logo" className="w-full h-full object-contain" />
      </div>
      
      {/* Color Dot */}
      <div 
        className={`${colorDotSize} rounded-full shadow-inner ${colorClass}`}
        title={vehicle.color}
      ></div>
    </div>
  );
};

export default VehicleVisuals;