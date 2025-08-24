"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import AboutSlider from "../../components/AboutSlider";

export default function AboutPage() {
  const [open, setOpen] = useState(true);
  const router = useRouter();

  const handleOpenTeam = () => {
    router.push("/team");
  };

  const handleClose = () => {
    router.push("/");
  };

  return (
    <AboutSlider
      open={open}
      onClose={handleClose}
      onOpenTeam={handleOpenTeam}
    />
  );
}