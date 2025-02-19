import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const showToast = (message, type = "success") => {
  toast[type](message, {
    position: "top-center",
    autoClose: 3000,
    theme: "dark",
  });
};
