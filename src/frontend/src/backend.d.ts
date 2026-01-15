import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface Video {
    id: string;
    title: string;
    duration: bigint;
    order: bigint;
    contentUrl: string;
    isPaid: boolean;
}
export interface Review {
    userId: Principal;
    submittedAt: Time;
    comment: string;
    rating: bigint;
    courseId: string;
}
export interface Instructor {
    id: string;
    bio: string;
    profileImage?: ExternalBlob;
    name: string;
    qualifications: Array<string>;
    experience: bigint;
}
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export type Time = bigint;
export interface http_header {
    value: string;
    name: string;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface Course {
    id: string;
    curriculum: Array<string>;
    title: string;
    duration: bigint;
    prerequisites: Array<string>;
    instructor: string;
    difficulty: string;
    description: string;
    isFree: boolean;
    category: string;
    price: bigint;
    videos: Array<Video>;
}
export interface LiveClass {
    id: string;
    startTime: Time;
    title: string;
    duration: bigint;
    recordingUrl?: string;
    instructor: string;
    description: string;
    attendees: Array<Principal>;
    courseId: string;
}
export interface ShoppingItem {
    productName: string;
    currency: string;
    quantity: bigint;
    priceInCents: bigint;
    productDescription: string;
}
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export type StripeSessionStatus = {
    __kind__: "completed";
    completed: {
        userPrincipal?: string;
        response: string;
    };
} | {
    __kind__: "failed";
    failed: {
        error: string;
    };
};
export interface StripeConfiguration {
    allowedCountries: Array<string>;
    secretKey: string;
}
export interface UserProfile {
    name: string;
    email: string;
    enrolledCourses: Array<string>;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addInstructor(instructor: Instructor, providedAdminKey: string): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    completeVideo(videoId: string): Promise<void>;
    createCheckoutSession(items: Array<ShoppingItem>, successUrl: string, cancelUrl: string): Promise<string>;
    createCourse(course: Course, providedAdminKey: string): Promise<void>;
    createCourseWithoutAdminKey(course: Course): Promise<void>;
    enrollInCourse(courseId: string): Promise<void>;
    filterCoursesByCategory(category: string): Promise<Array<Course>>;
    filterCoursesByDifficulty(difficulty: string): Promise<Array<Course>>;
    getAllCourses(): Promise<Array<Course>>;
    getAllInstructors(): Promise<Array<Instructor>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCourse(id: string): Promise<Course>;
    getCourseAverageRating(courseId: string): Promise<number | null>;
    getCourseReviews(courseId: string): Promise<Array<Review>>;
    getCourseVideos(courseId: string): Promise<Array<Video>>;
    getFreeCourses(): Promise<Array<Course>>;
    getInstructor(id: string): Promise<Instructor | null>;
    getMyEnrolledCourses(): Promise<Array<Course>>;
    getPaidCourses(): Promise<Array<Course>>;
    getStripeSessionStatus(sessionId: string): Promise<StripeSessionStatus>;
    getUpcomingLiveClasses(): Promise<Array<LiveClass>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getVideoContent(videoId: string): Promise<Video>;
    isCallerAdmin(): Promise<boolean>;
    isStripeConfigured(): Promise<boolean>;
    processCoursePayment(providerId: string, courseId: string, stripeSessionId: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    scheduleLiveClass(liveClass: LiveClass, providedAdminKey: string): Promise<void>;
    setAdminKey(newKey: string): Promise<void>;
    setStripeConfiguration(config: StripeConfiguration): Promise<void>;
    submitReview(review: Review): Promise<void>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
    updateVideoProgress(videoId: string, progress: bigint): Promise<void>;
    verifyAdminKey(providedKey: string): Promise<boolean>;
}
