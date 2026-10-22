import React from 'react';
import { PaymentsView } from './PaymentsView';

export function PayoutsView({ onShowToast }) {
  return <PaymentsView defaultTab="payouts" onShowToast={onShowToast} />;
}
