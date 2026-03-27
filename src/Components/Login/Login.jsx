import OverlayLoading from "../OverlayLoading/OverlayLoading";
import { AuthContext } from "../../Context/AuthContext";
import { zodResolver } from '@hookform/resolvers/zod';
import { RiLockPasswordFill } from "react-icons/ri";
import { Link, useNavigate } from "react-router-dom";
import { useContext, useState } from "react";
import { useForm } from 'react-hook-form';
import { MdEmail } from "react-icons/md";
import { z } from "zod";
import axios from 'axios';

export default function Login() {

  // handle Overlay Loading 
  const [isLoading, setIsLoading] = useState(false);

  // Handdle Success Login
  const [isLogin, setIsLogin] = useState(false);

  // Handdle Login Fail
  const [isLoginFail, setIsLoginFail] = useState(false);

  const navigate = useNavigate();

  const { userToken, setUserToken } = useContext(AuthContext);

  // Zod Schema Validition
  const loginSchema = z.object({
    email: z.string()
      .email('Invalid Email'),

    password: z.string()
      .min(1, 'Invalid Password')
  })

  // React Hook Form Object
  const form = useForm({
    defaultValues: {
      email: '',
      password: '',
    },

    resolver: zodResolver(loginSchema)
  });

  const { register, handleSubmit, formState } = form;

  // Handdle Register Button
  function handdleLogin(loginData) {
    sendLoginData(loginData);
  }

  // Send Registerion Data To API
  async function sendLoginData(loginData) {
    try {
      setIsLoading(true);

      const response = await axios.post('https://route-posts.routemisr.com/users/signin', loginData);

      if (response.status === 200) {
        localStorage.setItem('userToken', response.data.data.token);
        setUserToken(response.data.data.token);
        navigate('/');
      }
    }

    catch (err) {
      setIsLoginFail(true);
    }

    finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen flex items-center justify-center px-4">

        <div className="w-full max-w-6xl flex flex-col lg:flex-row items-center gap-10">

          {/* Form Section */}
          <div className="w-full lg:w-1/2">
            <form
              className="bg-white mt-3 p-6 rounded-2xl shadow-lg"
              onSubmit={handleSubmit(handdleLogin)}
            >
              <h2 className="text-3xl font-bold mb-6 text-center">
                Login
              </h2>

              {isLoginFail && (
                <p className="p-2 bg-red-500 text-white font-semibold rounded-md mb-4 text-center">
                  Invalid Email or Password
                </p>
              )}

              {/* Email */}
              <div className="relative mb-4">
                <label className="block mb-2 text-start">Email :</label>

                <MdEmail
                  className="absolute top-11 left-4 text-gray-400"
                  size={20}
                />

                <input
                  {...register("email")}
                  type="email"
                  className="w-full py-2 ps-10 border rounded-full focus:outline-none"
                  placeholder="Enter Full Email"
                />
              </div>

              {formState.errors.email && (
                <p className="p-2 mb-3 bg-red-400 text-white rounded-md text-sm">
                  {formState.errors.email.message}
                </p>
              )}

              {/* Password */}
              <div className="relative mb-4">
                <label className="block mb-2 text-start">Password :</label>

                <RiLockPasswordFill
                  className="absolute top-11 left-4 text-gray-400"
                  size={20}
                />

                <input
                  type="password"
                  {...register("password")}
                  className="w-full py-2 ps-10 border rounded-full focus:outline-none"
                  placeholder="Enter password"
                />
              </div>

              {formState.errors.password && (
                <p className="p-2 mb-3 bg-red-400 text-white rounded-md text-sm">
                  {formState.errors.password.message}
                </p>
              )}

              {/* Button */}
              {isLoading ? (
                <div className="mt-5 bg-primary-500 rounded-md p-3 flex justify-center">
                  <OverlayLoading />
                </div>
              ) : (
                <button
                  type="submit"
                  disabled={isLoading}
                  className="mt-5 w-full bg-primary-500 hover:bg-primary-600 text-white font-semibold py-2 rounded-md transition duration-300"
                >
                  Log in
                </button>
              )}
            </form>

            <button className="mt-4 font-semibold text-primary-500 block mx-auto">
              Forget Password ?
            </button>

            <Link
              to="/register"
              className="mt-6 block text-center p-2 rounded-md border border-primary-500 text-primary-500 font-semibold hover:bg-gray-100 transition"
            >
              Create new account
            </Link>
          </div>

          <div className="w-50 lg:w-1/2 px-2 flex justify-center">
            <img
              src="/4٠.jpg"
              className="w-75 max-w-md rounded-xl shadow-lg object-cover"
              alt="Login"
            />
          </div>

        </div>

      </div>
    </>
  )
}