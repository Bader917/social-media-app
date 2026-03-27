import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

const UserExistsAlert = ({ open, onClose }) => {
  const navigate = useNavigate();

  if (!open) return null;

  Swal.fire({
    icon: "warning",
    title: "Account Already Exists",
    text: "This email is already registered. Please Try Login",
    showCancelButton: true,
    confirmButtonText: "Login Page",
    cancelButtonText: "Cancel",
    customClass: {
      title: "swal-title-bold",
      popup: "swal-text-bold"
    },

  }).then((result) => {
    if (result.isConfirmed) {
      navigate("/login");
    }
    onClose();
  });

  return null;
};

export default UserExistsAlert;