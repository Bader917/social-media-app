import { FaUser } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import { RiLockPasswordFill } from "react-icons/ri";
import { zodResolver } from '@hookform/resolvers/zod';
import OverlayLoading from "../OverlayLoading/OverlayLoading";
import { useForm } from 'react-hook-form';
import { z } from "zod";
import axios from 'axios';
import { useState } from "react";
import UserExistsAlert from "../UserExistsAlert/UserExistsAlert";
import RegisterSuccessAlert from "../RegisterSuccessAlert/RegisterSuccessAlert";


export default function Register() {

  // handle Overlay Loading 
  const [isLoading, setIsLoading] = useState(false);

  // Handle User Exists Msg
  const [isUserExists, setIsUserExists] = useState(false);

  // Handdle Success Registerition Msg
  const [successRegiser, setSuccessRegister] = useState(false);

  // Zod Schema Validition
  const registertionSchema = z.object({
    name: z.string()
      .min(3, 'Min Chars Is 3 Chars')
      .max(25, 'Max Length Of Chras Is 25 Chars')
      .regex(/^[A-Za-z\u0600-\u06FF]{3,10}\s[A-Za-z\u0600-\u06FF]{3,10}$/, 'Name must include first and last name Only'),

    email: z.string()
      .email('Email Is Not Valid'),

    password: z.string()
      .min(8, 'Password Must 8 Char Or More')
      .max(16, 'Max Char is 25 Char')
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,16}$/, 'Password Must Be Capital Char Or More, Numbers'),

    rePassword: z.string()
      .min(1, 'Your Password Not Match'),

    dateOfBirth: z.string().refine((value) => {
      const birthDate = new Date(value);
      const today = new Date();

      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();

      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birthDate.getDate())
      ) {
        age--;
      }

      return age >= 18;
    }, {
      error: "You must be 18 years or older"
    }),

    gender: z.enum(['male', 'female'], { error: 'Must Choose Your Gender' }),

  }).refine((value) => value.password === value.rePassword, {
    error: 'Password Not Match',
    path: ['rePassword']
  });

  // React Hook Form Object
  const form = useForm({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      rePassword: '',
      dateOfBirth: '',
      gender: '',
    },

    resolver: zodResolver(registertionSchema)
  });

  const { register, handleSubmit, formState } = form;

  // Handdle Register Button
  function handleRegister(signupData) {
    sendRegistertionData(signupData);
  }

  // Send Registerion Data To API
  async function sendRegistertionData(signupData) {
    try {
      setIsLoading(true);

      const response = await axios.post('https://route-posts.routemisr.com/users/signup', signupData);

      // Handdle Navigate User To Login After Rigster
      if (response.data.message === 'account created') {
        setSuccessRegister(true);
      }
    }

    catch (err) {
      setIsUserExists(true);
    }

    finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className={`text-center ${isLoading ? "-z-50" : ""}`}>
        <h2 className='text-3xl font-bold mt-2'>Create Account</h2>

        <form
          className="max-w-md mx-auto my-5 bg-white p-5 rounded-2xl"
          onSubmit={handleSubmit(handleRegister)}
        >

          <div className="relative z-0 w-full mb-3 group">
            <label htmlFor="name" className='text-base block text-start'>
              Full Name :
            </label>

            <FaUser className='absolute top-[50%] translate-y-[50%] left-4 text-gray-300' size={22} />

            <input
              {...register('name')}
              type="text"
              id="name"
              className="block py-1 w-full text-xl placeholder:text-base mt-2 text-heading bg-transparent rounded-3xl ps-10 border-2 appearance-none focus:outline-blue-400 focus:ring-0 focus:border-brand peer border-gray-300"
              placeholder="Enter Full Name"
            />
          </div>

          {formState.errors.name && <p className='p-2 m-2 rounded-4xl bg-red-400 font-semibold text-white'>{formState.errors.name.message}</p>}


          <div className="relative z-0 w-full mb-3 group">
            <label htmlFor="email" className='text-base block text-start'>
              Email :
            </label>

            <MdEmail className='absolute top-[50%] translate-y-[50%] left-4 text-gray-300' size={22} />

            <input
              {...register('email')}
              type="email"
              id="email"
              className="block py-1 w-full text-xl placeholder:text-base mt-2 text-heading bg-transparent rounded-3xl ps-10 border-2 appearance-none focus:outline-blue-400 focus:ring-0 focus:border-brand peer border-gray-300"
              placeholder="Enter Full Email"
            />
          </div>

          {formState.errors.email && <p className='p-2 m-2 rounded-4xl bg-red-400 font-semibold text-white'>{formState.errors.email.message}</p>}

          <div className="relative z-0 w-full mb-3 group">
            <label htmlFor="password" className='text-base block text-start'>
              Password :
            </label>

            <RiLockPasswordFill className='absolute top-[50%] translate-y-[50%] left-4 text-gray-300' size={22} />

            <input
              type="password"
              {...register('password')}
              id="password"
              className="block py-1 w-full text-xl placeholder:text-base mt-2 text-heading bg-transparent rounded-3xl ps-10 border-2 appearance-none focus:outline-blue-400 focus:ring-0 focus:border-brand peer border-gray-300"
              placeholder="Enter password"
            />
          </div>

          {formState.errors.password && <p className='p-2 m-2 rounded-4xl bg-red-400 font-semibold text-white'>{formState.errors.password.message}</p>}

          <div className="relative z-0 w-full mb-3 group">
            <label htmlFor="re-password" className='text-base block text-start'>
              rePassword :
            </label>

            <RiLockPasswordFill className='absolute top-[50%] translate-y-[50%] left-4 text-gray-300' size={22} />

            <input
              type="password"
              {...register('rePassword')}
              id="re-password"
              className="block py-1 w-full text-xl placeholder:text-base mt-2 text-heading bg-transparent rounded-3xl ps-10 border-2 appearance-none focus:outline-blue-400 focus:ring-0 focus:border-brand peer border-gray-300"
              placeholder="Confirm Password"
            />
          </div>

          {formState.errors.rePassword && <p className='p-2 m-2 rounded-4xl bg-red-400 font-semibold text-white'>{formState.errors.rePassword.message}</p>}

          <div className="relative z-0 w-full mb-3 group">
            <label htmlFor="dateOfBirth" className='text-base block text-start'>
              BirthDay :
            </label>

            <input
              type="date"
              {...register('dateOfBirth')}
              id="dateOfBirth"
              className="block py-1 w-full text-xl placeholder:text-base mt-2 text-heading bg-transparent rounded-3xl px-5 border-2 appearance-none focus:outline-blue-400 focus:ring-0 focus:border-brand peer border-gray-300"
            />
          </div>

          {formState.errors.dateOfBirth && <p className='p-2 m-2 rounded-4xl bg-red-400 font-semibold text-white'>{formState.errors.dateOfBirth.message}</p>}

          <div>
            <div className="flex items-center mb-4">
              <input
                {...register('gender')}
                id="male"
                type="radio"
                value='male'
                className="w-5 h-5 cursor-pointer checked:bg-blue-400 checked:border-blue-400 checked:outline-blue-200 rounded-full"
              />
              <label htmlFor="male" className="select-none cursor-pointer ms-2 text-sm font-medium text-heading">Male</label>
            </div>
            <div className="flex items-center">
              <input
                {...register('gender')}
                id="female"
                type="radio"
                value='female'
                className="w-5 h-5 cursor-pointer text-neutral-primary checked:bg-blue-400 checked:border-blue-400 rounded-full"
              />
              <label htmlFor="female" className="select-none cursor-pointer ms-2 text-sm font-medium text-heading">Female</label>
            </div>

            {formState.errors.gender && <p className='p-2 m-2 rounded-4xl bg-red-400 font-semibold text-white'>{formState.errors.gender.message}</p>}
          </div>

          {
            isLoading ?
              <div className="p-3 bg-violet-700 mt-5 rounded-md">
                <OverlayLoading />
              </div>
              :
              <button
                type='submit'
                disabled={isLoading}
                className="text-white bg-violet-700 cursor-pointer rounded-md w-full text-md font-semibold box-border border border-transparent hover:bg-violet-800 duration-300 shadow-xs leading-5 px-2 py-2 mt-5">
                Submit
              </button>
          }

        </form>


        {isUserExists &&
          <UserExistsAlert
            open={isUserExists}
            onClose={() => setIsUserExists(false)}
          />
        }

        {
          successRegiser &&
          <RegisterSuccessAlert
            open={successRegiser}
            onClose={() => setSuccessRegister(false)}
          />
        }

      </div>
    </>
  )
}