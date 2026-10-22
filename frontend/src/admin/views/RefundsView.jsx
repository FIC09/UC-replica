import React from 'react';
import { PaymentsView } from './PaymentsView';

export function RefundsView({ onShowToast }) {
  return <PaymentsView defaultTab="refunds" onShowToast={onShowToast} />;
}
