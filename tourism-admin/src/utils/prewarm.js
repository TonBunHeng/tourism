import placeService from '../services/placeService';
import bookingService from '../services/bookingService';
import categoryService from '../services/categoryService';
import provinceService from '../services/provinceService';
import tourService from '../services/tourService';
import guideService from '../services/guideService';
import businessService from '../services/businessService';
import userService from '../services/userService';
import notificationService from '../services/notificationService';
import securityService from '../services/securityService';
import userTrackingService from '../services/userTrackingService';

let prewarmed = false;

export function prewarmAdminCaches() {
  if (prewarmed) return;
  prewarmed = true;

  const tasks = [
    () => placeService.getPlaces({ page: 1, per_page: 10 }),
    () => bookingService.getBookings({ per_page: 100 }),
    () => categoryService.getCategories({ per_page: 100 }),
    () => provinceService.getProvinces({ per_page: 100 }),
    () => tourService.getTours({ per_page: 100 }),
    () => guideService.getGuides({ per_page: 100 }),
    () => businessService.getAdminAll({}),
    () => userService.getUsers({ page: 1, per_page: 10 }),
    () => notificationService.getNotifications({}),
    () => securityService.getAlerts({ per_page: 100 }),
    () => userTrackingService.getLogs({ page: 1, per_page: 10 }),
  ];

  tasks.forEach((task, index) => {
    setTimeout(() => {
      task().catch(() => {});
    }, index * 100);
  });
}
