"use server";

export async function submitPost(formData)  {
  const content = formData.get("content");
  // check if the code has been there in history
  // if the code has been there, return an string of exist
  // if not there, post the content to the API

  const res = await fetch("https://api.example.com/posts", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ content }),
  });

  if (!res.ok) {
    throw new Error("Failed to submit post");
  }

  const data = await res.json();
  // update store content with the new data (maybe need to do it in other server function after get the updated client side data)
  return data;
}