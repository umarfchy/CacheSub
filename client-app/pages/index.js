import { useState, useEffect } from "react";
import axios from "axios";

export default function Home() {
  const baseUrl = "http://new-shared-network:5001";
  const getDataUrl = `${baseUrl}/create`;
  const createDataUrl = `${baseUrl}/data`;

  const createData = async (inputText) => {
    try {
      const { data } = await axios.post(createDataUrl, { data: "inputText" });
      console.log({ message: "posted data", data });
      return data;
    } catch (error) {
      console.error({ message: "failed creating data.", error });
    }
  };

  const getData = async () => {
    try {
      const { data } = await axios.get(createDataUrl);
      console.log({ message: "got data", data });
      return data;
    } catch (error) {
      console.error({ message: "failed fetching data.", error });
    }
  };

  return (
    <div>
      <button onClick={getData}>Get Data</button>
      <br />
      <button onClick={createData}>Create Data</button>
    </div>
  );
}
