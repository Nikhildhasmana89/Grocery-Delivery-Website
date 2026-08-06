'use client';

import { useState } from "react";
import RegisterForm from "@/components/RegisterForm";
import Welcome from "@/components/Welcome";

export default function Register() {
  const [step, setStep] = useState(1);

  return (
    <div>
      {step == 1 ? <Welcome nextStep={setStep} /> : <RegisterForm previousStep={setStep} />}
    </div>
  );
}