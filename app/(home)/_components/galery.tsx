import Image from 'next/image';

const Galery = () => {
  return (
    <section className="flex w-full flex-col gap-3 px-5 grayscale lg:px-0">
      <div className="flex w-full gap-3">
        <div className="flex w-full flex-col gap-3"> {/* Removed overflow-hidden from direct parent of Image if it clips Image */}
          <div className="relative flex h-40 w-full overflow-hidden rounded-lg">
            <Image
              src="/image_galery_1.jpg"
              alt="Galeria imagem 1"
              fill
              className="object-cover duration-200 hover:scale-105 hover:opacity-30"
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            />
          </div>

          <div className="relative flex h-40 w-full overflow-hidden rounded-lg">
            <Image
              src="/image_galery_2.jpg"
              alt="Galeria imagem 2"
              fill
              className="object-cover duration-200 hover:scale-105 hover:opacity-30"
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            />
          </div>
        </div>

        <div className="flex gap-3"> {/* Removed overflow-hidden from direct parent of Image if it clips Image */}
          <div className="relative flex h-[332px] w-[350px] overflow-hidden rounded-lg md:w-[1000px]">
            <Image
              src="/teste.jpeg"
              alt="Galeria imagem teste"
              fill
              className="object-cover duration-200 hover:scale-105 hover:opacity-30 md:w-[1000px]" // md:w-[1000px] here might be redundant if parent div controls width
              sizes="(max-width: 768px) 80vw, (min-width: 769px) 350px, 1000px"
            />
          </div>

          <div className="flex flex-col gap-3"> {/* Removed overflow-hidden */}
            <div className="relative flex h-28 w-full overflow-hidden rounded-lg md:w-[1400px]"> {/* md:w-[1400px] on parent? */}
              <Image
                src="/image_galery_4.jpg"
                alt="Galeria imagem 4"
                fill
                className="object-cover duration-200 hover:scale-105 hover:opacity-30"
                sizes="(max-width: 768px) 50vw, (min-width: 769px) md:w-[1400px], 25vw" // Sizes might need adjustment based on actual layout goals
              />
            </div>

            <div className="relative flex h-[208px] w-full overflow-hidden rounded-lg">
              <Image
                src="/image_galery_5.jpg"
                alt="Galeria imagem 5"
                fill
                className="object-cover duration-200 hover:scale-105 hover:opacity-30"
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex w-full gap-3">
        <div className="relative flex h-[332px] w-full gap-3 overflow-hidden rounded-lg">
          <Image
            src="/image_galery_6.jpg"
            alt="Galeria imagem 6"
            fill
            className="object-cover duration-200 hover:scale-105 hover:opacity-30"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>

        <div className="flex w-full flex-col gap-3 md:w-[3000px] md:flex-row"> {/* Removed overflow-hidden */}
          <div className="relative flex h-40 w-full gap-3 overflow-hidden rounded-lg md:h-[332px] md:w-[2500px]">
            <Image
              src="/image_galery_7.jpg" // Corrected path, assuming images are in public folder
              alt="Galeria imagem 7"
              fill
              className="object-cover duration-200 hover:scale-105 hover:opacity-30"
              sizes="(max-width: 768px) 50vw, (min-width: 769px) md:h-[332px], 25vw"
            />
          </div>

          <div className="relative flex h-40 w-full gap-3 overflow-hidden rounded-lg md:h-[332px]">
            <Image
              src="/image_galery_8.jpg" // Corrected path
              alt="Galeria imagem 8"
              fill
              className="object-cover duration-200 hover:scale-105 hover:opacity-30"
              sizes="(max-width: 768px) 50vw, (min-width: 769px) md:h-[332px], 25vw"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Galery;