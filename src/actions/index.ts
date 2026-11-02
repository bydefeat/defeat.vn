/** Điểm đăng ký Actions — mỗi module tự định nghĩa action của mình. */
import { contactAction } from '@modules/contact/action';

export const server = {
  contact: contactAction,
};
