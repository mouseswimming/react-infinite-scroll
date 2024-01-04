import { useCallback, useRef } from "react";
import { useState } from "react";
import { useEffect } from "react";
import { parseLinkHeader } from "./parseLinkHeader";

const LIMIT = 20;

function App() {
  const [photos, setPhotos] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const nextLink = useRef();

  // assign useCallback to ref for the element that will be added but haven't added.
  const imageRef = useCallback((image) => {
    if (image == null || nextLink.current == null) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        fetchPhotos(nextLink.current);
        observer.unobserve(image);
      }
    });

    observer.observe(image);
  }, []);

  async function fetchPhotos(url, { overwrite = false } = {}) {
    setIsLoading(true);
    try {
      await new Promise((res) => setTimeout(res, 500));
      const resp = await fetch(url);
      nextLink.current = parseLinkHeader(resp.headers.get("Link")).next;

      const photos = await resp.json();

      if (overwrite) {
        setPhotos(photos);
      } else {
        setPhotos((prev) => [...prev, ...photos]);
      }
    } catch (e) {
      alert(e);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchPhotos(
      `http://localhost:3000/photos-short-list?_page=1&_limit=${LIMIT}`,
      {
        overwrite: true,
      }
    );
  }, []);

  return (
    <>
      <div className="grid">
        {photos.map((photo, index) => (
          <img
            src={photo.url}
            key={photo.id}
            ref={index === photos.length - 1 ? imageRef : undefined}
          />
        ))}
        {isLoading &&
          Array.from({ length: LIMIT }, (_, index) => index).map((n) => {
            return (
              <div key={n} className="skeleton">
                Loading...
              </div>
            );
          })}
      </div>
    </>
  );
}

export default App;
