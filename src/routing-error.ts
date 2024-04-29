import { RouteErrorDetail, RouteErrorType } from "./types";

export class RoutingError extends Error {
  place: string;
  errorType: RouteErrorType;

  constructor(errorDetail: RouteErrorDetail) {
    const { message, place, errorType } = errorDetail;
    super(message);
    this.name = "RoutingError";
    this.place = place ?? "Unknown";
    this.errorType = errorType ?? RouteErrorType.UnknownError;
    this.message = `${this.place}: ${this.message} (Error type: ${this.errorType})`;
  }
}
