const Interview = () => {
    return (
      <div className="flex h-screen">
        <div className="w-[70%] ml-10 mr-5 my-8 bg-black rounded-3xl"></div>
        <div className="w-[30%] flex flex-col justify-between my-8 mr-10">
          <div className="bg-[#0F0F36] h-[70%] p-4 rounded-3xl"></div>
          <div className="flex flex-col items-center mt-5 h-[30%]">
            <div className="w-full h-full flex justify-center items-center border border-gray-300">
              <p>Recording...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  export default Interview;  