import { useMutation } from "@tanstack/react-query";

import { resendOtp } from "../services/auth.service";

export function useResendOtp() {
  return useMutation({
    mutationFn: resendOtp,
  });
}
