import Stripe from "stripe";
import config from "../config";

export const stripe = new Stripe(config.stripe_secret_key, {
	apiVersion: "2025-02-24.acacia" as any,
	typescript: true,
});
