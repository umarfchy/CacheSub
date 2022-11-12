import { useState } from "react";
import axios from "axios";

export default function Home() {
  const [value, updateValue] = useState("create new data");
  const baseUrl = "http://mynetwork:5001";
  const getDataUrl = `${baseUrl}/data`;
  const createDataUrl = `${baseUrl}/create`;

  const createData = async (inputText) => {
    try {
      const { data } = await axios.post(createDataUrl, { data: inputText });
      console.log({ message: "posted data", data });
      return data;
    } catch (error) {
      console.error({ message: "failed creating data.", error });
    }
  };

  const getData = async () => {
    try {
      const { data: res } = await axios.get(getDataUrl);
      updateValue(res.data);
      console.log({ message: "got data", data });
      return res;
    } catch (error) {
      console.error({ message: "failed fetching data.", error });
    }
  };

  const handleSubmit = async (evt) => {
    evt.preventDefault();
    await createData(evt.target.value);
  };

  return (
    <main style={{ display: "grid", placeItems: "center", height: "100vh" }}>
      <section style={{ zoom: "1.2", display: "grid", placeItems: "center" }}>
        <form onSubmit={handleSubmit}>
          <input type="text" />
          <input type="submit" value="create data" />
        </form>
        <button onClick={getData} style={{ margin: "1rem 0" }}>
          get data
        </button>
        <p>
          Try creating a data using input. Then click on "get data" twice to see
          the magic
        </p>
      </section>
      <section
        style={{
          border: "1px solid lightsalmon",
          height: "20rem",
          width: "20rem",
          textAlign: "center",
        }}
      >
        <h3>output</h3>
        <p>{value}</p>
      </section>
    </main>
  );
}
