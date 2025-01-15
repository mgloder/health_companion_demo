import { Link } from "react-router-dom";

export default function Home() {
  return (
    <>
      <div className="flex p-4 justify-between">
        <h1 className="text-4xl inline-block self-start">Sisyphus</h1>
        <Link to="/profile" className="self-end">
          <img className="inline-block size-10 rounded-full ring-2 ring-white"
               src="https://images.unsplash.com/photo-1491528323818-fdd1faba62cc?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
               alt="" />
        </Link>
      </div>
      <div className="relative flex p-4 justify-center gap-4">
        <div className="flex flex-1 justify-center items-center rounded-2xl h-16 bg-black text-white">
          <p className="text-4xl">315.7<span className="text-base font-light ml-2">hours</span></p>
        </div>
        <div className="absolute left-1/2 top-1/2 z-20 m-auto flex -translate-x-1/2 -translate-y-1/2 transform">
          <button
            className="inline-flex rounded-full border border-solid border-gray-250 bg-white p-4 hover:bg-gray-150">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 17 17" aria-hidden="true"
                 className="h-4 w-4 rotate-90 text-greyblue-400 md:rotate-0">
              <path fill="currentColor" fill-rule="evenodd"
                    d="M11.726 1.273l2.387 2.394H.667V5h13.446l-2.386 2.393.94.94 4-4-4-4-.94.94zM.666 12.333l4 4 .94-.94L3.22 13h13.447v-1.333H3.22l2.386-2.394-.94-.94-4 4z"
                    clip-rule="evenodd"></path>
            </svg>
          </button>
        </div>
        <div className="flex flex-1 justify-center items-center rounded-2xl h-16 bg-black text-white">
          <p className="text-4xl">69.00<span className="text-base font-light ml-2">mbc</span></p>
        </div>
      </div>
    </>
  );
}
