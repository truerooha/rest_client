export const ORDER_CONFIG = {
  discountPercent: 10,
  cancelDeadline: '10:30',
  fallbackSlots: [
    { id: '09:00', time: '09:00', deadline: '06:30', isAvailable: false },
    { id: '13:00', time: '12:00', deadline: '09:30', isAvailable: true },
    { id: '18:00', time: '18:00', deadline: '15:30', isAvailable: false },
  ],
}
