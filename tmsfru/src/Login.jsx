// Login.js
import React, { useState } from "react";
import { useAuth } from "./Context/AuthContext";
import { Link } from "react-router-dom";
import { loginUser } from "./Api";
import { toast } from "react-toastify";

const Login = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const response = await loginUser(email, password);
      console.log(response);
      if (response.success) {
        console.log("Login successful:", response.user);
        login(response.user);
        toast.success("Login successful");
      } else {
        console.error("Login failed:", response.message);
        toast.error("Login failed");
      }
    } catch (error) {
      console.error("Error logging in:", error);
      toast.error("Error logging in");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="bg-gray border-2 border-violet-500 p-8 rounded shadow-md w-96">
        <h2 className="text-2xl font-semibold mb-4">Login</h2>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="email"
          >
            Email
          </label>
          <input
            className="w-full border rounded border-2 border-violet-500 px-3 py-2"
            type="email"
            id="email"
            placeholder="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="password"
          >
            Password
          </label>
          <input
            className="w-full border rounded border-2 border-violet-500 px-3 py-2"
            type="password"
            id="password"
            placeholder="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          onClick={handleLogin}
        >
          Login
        </button>
        <div className="flex justify-between items-center">
          <span className="text-gray-500 text-sm">Don't have an account? click on the</span>
          <Link to={"/signup"}>signup</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
