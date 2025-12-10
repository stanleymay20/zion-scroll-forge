/**
 * Academic Calendar Page
 * Main page for academic calendar management
 * 
 * Requirements: 1.1, 1.2, 1.3, 1.4
 */

import React from 'react';
import { AcademicCalendarBuilder } from '@/components/academic-calendar';

export const AcademicCalendar: React.FC = () => {
  return (
    <div className="container mx-auto py-6 px-4">
      <AcademicCalendarBuilder />
    </div>
  );
};

export default AcademicCalendar;
