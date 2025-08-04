"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import NewTeamSlider from "../../components/NewTeamSlider";

export default function TeamPage() {
  const [open, setOpen] = useState(true);
  const router = useRouter();

  const handleClose = () => {
    router.push("/");
  };

  return (
    <NewTeamSlider
      open={open}
      onClose={handleClose}
    />
  );
}