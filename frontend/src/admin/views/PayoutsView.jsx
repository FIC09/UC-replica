import React from 'react';
import { PaymentsView } from './PaymentsView';

export function PayoutsView({ onShowToast, onNavigate }) {
  return <PaymentsView defaultTab="payouts" onShowToast={onShowToast} onNavigate={onNavigate} />;
}
