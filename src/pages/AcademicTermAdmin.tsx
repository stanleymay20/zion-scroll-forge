/**
 * Academic Term Administration Page
 * Full management interface for academic terms
 */

import React from 'react';
import AcademicTermManagement from '@/components/admin/AcademicTermManagement';

console.info("✝️ Academic Term Admin — Managing the seasons of education");

export default function AcademicTermAdmin() {
  return (
    <div className="container mx-auto py-6 px-4">
      <AcademicTermManagement />
    </div>
  );
}