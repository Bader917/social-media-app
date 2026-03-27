import { ThreeDots } from 'react-loader-spinner';

export default function OverlayLoading() {
  return (
    <ThreeDots
      height={40}
      width={40}
      radius={9}
      color="white"
      ariaLabel="audio-loading"
      wrapperStyle={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}
      wrapperClass=""
    />
  )
}