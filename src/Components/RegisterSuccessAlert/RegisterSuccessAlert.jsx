import { useEffect } from "react";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

const RegisterSuccessAlert = ({ open, onClose }) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) return;

    const timer = setTimeout(() => {
      Swal.fire({
        icon: "success",
        title: "Registration Successful",
        html: "Your account has been created successfully",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        customClass: {
          timerProgressBar: "my-progress-bar",
          title: "swal-title-bold",
        },
      }).then(() => {
        onClose();
        navigate("/login");
      });
    }, 0);

    return () => clearTimeout(timer);
  }, [open, onClose, navigate]);

  return null;
};

export default RegisterSuccessAlert;