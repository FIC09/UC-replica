import React from 'react';
import { PaymentsView } from './PaymentsView';

export function RefundsView({ onShowToast, onNavigate }) {
  return <PaymentsView defaultTab="refunds" onShowToast={onShowToast} onNavigate={onNavigate} />;
}
