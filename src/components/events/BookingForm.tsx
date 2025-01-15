import React, { useState } from 'react';
import { Event } from '../../types/event';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';

interface BookingFormProps {
  event: Event;
  quantity: number;
  onClose: () => void;
}

type Step = 'buyer-info' | 'payment' | 'processing';

interface BuyerInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city: string;
  country: string;
}

export default function BookingForm({ event, quantity, onClose }: BookingFormProps) {
  const [step, setStep] = useState<Step>('buyer-info');
  const [buyerInfo, setBuyerInfo] = useState<BuyerInfo>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    city: '',
    country: ''
  });
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptMarketing, setAcceptMarketing] = useState(false);
  const { user } = useAuth();

  const serviceFee = 0.75;
  const totalPrice = event.price * quantity;
  const finalTotal = totalPrice + serviceFee;

  const handleBuyerInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('payment');
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStep('processing');
    
    try {
      // Create a guest ticket record
      const { error: ticketError } = await supabase
        .from('tickets')
        .insert({
          event_id: event.id,
          user_id: user?.id || null, // Allow null for guest purchases
          quantity,
          total_price: finalTotal,
          status: 'pending',
          guest_info: user ? null : {
            first_name: buyerInfo.firstName,
            last_name: buyerInfo.lastName,
            email: buyerInfo.email,
            phone: buyerInfo.phone,
            city: buyerInfo.city,
            country: buyerInfo.country
          }
        });

      if (ticketError) throw ticketError;

      // Update available tickets
      const { error: eventError } = await supabase
        .from('events')
        .update({ available_tickets: event.available_tickets - quantity })
        .eq('id', event.id);

      if (eventError) throw eventError;

      window.location.href = 'https://egate.anz.com/payment';
    } catch (err) {
      alert('Failed to process payment. Please try again.');
      setStep('payment');
    }
  };

  const OrderSummary = () => (
    <div className="bg-gray-50 p-6 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Order Details</h3>
      <div className="space-y-3">
        <div className="flex justify-between">
          <span>Tickets ({quantity}x)</span>
          <span>${totalPrice.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm text-gray-600">
          <span>Service Fee</span>
          <span>${serviceFee.toFixed(2)}</span>
        </div>
        <div className="border-t pt-2 flex justify-between font-semibold">
          <span>Total</span>
          <span>${finalTotal.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );

  if (step === 'processing') {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full text-center">
          <h2 className="text-2xl font-bold mb-4">Processing payment</h2>
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Please do not refresh or close your browser window</p>
          <button
            onClick={() => setStep('payment')}
            className="mt-4 text-blue-600 hover:underline"
          >
            Payment not working? Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-2xl font-bold">
            {step === 'buyer-info' ? 'Buyer Information' : 'Payment'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            {step === 'buyer-info' ? (
              <form onSubmit={handleBuyerInfoSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">First name</label>
                    <input
                      type="text"
                      required
                      value={buyerInfo.firstName}
                      onChange={e => setBuyerInfo({...buyerInfo, firstName: e.target.value})}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Last name</label>
                    <input
                      type="text"
                      required
                      value={buyerInfo.lastName}
                      onChange={e => setBuyerInfo({...buyerInfo, lastName: e.target.value})}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    required
                    value={buyerInfo.email}
                    onChange={e => setBuyerInfo({...buyerInfo, email: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <input
                    type="tel"
                    required
                    value={buyerInfo.phone}
                    onChange={e => setBuyerInfo({...buyerInfo, phone: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Town/City</label>
                    <input
                      type="text"
                      required
                      value={buyerInfo.city}
                      onChange={e => setBuyerInfo({...buyerInfo, city: e.target.value})}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Country</label>
                    <input
                      type="text"
                      required
                      value={buyerInfo.country}
                      onChange={e => setBuyerInfo({...buyerInfo, country: e.target.value})}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  Continue to Payment
                </button>
              </form>
            ) : (
              <form onSubmit={handlePaymentSubmit} className="space-y-6">
                <div className="space-y-4">
                  <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer">
                    <input
                      type="radio"
                      name="payment"
                      value="card"
                      defaultChecked
                      className="text-blue-600"
                    />
                    <span>Credit/Debit Card</span>
                    <div className="ml-auto flex gap-2">
                      <img src="https://www.vectorlogo.zone/logos/visa/visa-icon.svg" alt="Visa" className="h-6" />
                      <img src="https://www.vectorlogo.zone/logos/mastercard/mastercard-icon.svg" alt="Mastercard" className="h-6" />
                    </div>
                  </label>
                </div>

                <div className="space-y-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={acceptTerms}
                      onChange={e => setAcceptTerms(e.target.checked)}
                      required
                      className="text-blue-600"
                    />
                    <span className="text-sm">
                      I agree to the Terms and Conditions and Privacy Policy
                    </span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={acceptMarketing}
                      onChange={e => setAcceptMarketing(e.target.checked)}
                      className="text-blue-600"
                    />
                    <span className="text-sm">
                      I'd like to receive updates about events and offers
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  Complete Purchase
                </button>
              </form>
            )}
          </div>

          <div>
            <OrderSummary />
          </div>
        </div>
      </div>
    </div>
  );
}