import { useState, useEffect, useRef } from "react";

export const useFetch = (url) => {
  const [data, setData] = useState();
  const ignore = useRef(false);
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    fetch(url)
      .then((response) => response.json())
      .then((responseJson) => {
        if (!ignore.current) setData(responseJson);
        setIsLoading(false);
      })
      .catch((error) => {
        setIsError(false);
        console.log(error);
      });
    return () => {
      ignore.current = false;
    };
  }, [url]);

  return {
    data,
    isError,
    isLoading,
  };
};
