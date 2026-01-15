import Map "mo:core/Map";
import List "mo:core/List";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Time "mo:core/Time";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Runtime "mo:core/Runtime";
import Order "mo:core/Order";
import Principal "mo:core/Principal";

import OutCall "http-outcalls/outcall";
import AccessControl "authorization/access-control";
import Stripe "stripe/stripe";
import MixinAuthorization "authorization/MixinAuthorization";
import BlobStorage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";

actor {
  include MixinStorage();

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  var adminKey : ?Text = null; // Store the admin key securely in canister state

  public type UserProfile = {
    name : Text;
    email : Text;
    enrolledCourses : [Text];
  };

  public type Course = {
    id : Text;
    title : Text;
    description : Text;
    price : Nat; // price in cents
    isFree : Bool;
    instructor : Text;
    category : Text;
    difficulty : Text;
    videos : [Video];
    curriculum : [Text];
    duration : Nat; // in minutes
    prerequisites : [Text];
  };

  public type Video = {
    id : Text;
    title : Text;
    duration : Nat; // in seconds
    order : Nat;
    isPaid : Bool;
    contentUrl : Text;
  };

  public type LiveClass = {
    id : Text;
    courseId : Text;
    title : Text;
    description : Text;
    instructor : Text;
    startTime : Time.Time;
    duration : Nat; // in minutes
    attendees : [Principal];
    recordingUrl : ?Text;
  };

  public type Enrollment = {
    userId : Principal;
    courseId : Text;
    enrolledAt : Time.Time;
    progress : Nat; // 0-100
    completedVideos : [Text];
    liveClassesAttended : [Text];
  };

  public type Review = {
    userId : Principal;
    courseId : Text;
    rating : Nat; // 1-5
    comment : Text;
    submittedAt : Time.Time;
  };

  public type Instructor = {
    id : Text;
    name : Text;
    qualifications : [Text];
    experience : Nat; // in years
    bio : Text;
    profileImage : ?BlobStorage.ExternalBlob;
  };

  public type VideoProgress = {
    userId : Principal;
    videoId : Text;
    progress : Nat; // 0-100
    lastWatched : Time.Time;
  };

  public type Transaction = {
    id : Text;
    userId : Principal;
    providerId : ?Text;
    courseId : Text;
    amount : Nat;
    stripeSessionId : Text;
    status : Text;
    createdAt : Time.Time;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();
  let courses = Map.empty<Text, Course>();
  let reviews = Map.empty<Text, List.List<Review>>();
  let courseEnrollments = Map.empty<Text, List.List<Enrollment>>();
  let userEnrollments = Map.empty<Principal, List.List<Text>>(); // userId -> [courseId]
  let coursePayments = Map.empty<Text, List.List<Transaction>>();
  let instructors = Map.empty<Text, Instructor>();
  let videoProgress = Map.empty<Principal, List.List<VideoProgress>>();
  let liveClasses = Map.empty<Text, List.List<LiveClass>>();

  module Enrollment {
    public type Module = Enrollment;
    public func compare(a : Module, b : Module) : Order.Order {
      Nat.compare(a.progress, b.progress);
    };
  };

  public shared ({ caller }) func setAdminKey(newKey : Text) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only super admins can set the admin key");
    };
    adminKey := ?newKey;
  };

  public shared ({ caller }) func verifyAdminKey(providedKey : Text) : async Bool {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can verify the admin key");
    };
    switch (adminKey) {
      case (?storedKey) { storedKey == providedKey };
      case (null) { false };
    };
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Helper function to check if user is enrolled in a course
  func isUserEnrolledInCourse(userId : Principal, courseId : Text) : Bool {
    switch (userEnrollments.get(userId)) {
      case (?enrolledCourses) {
        for (enrolledCourse in enrolledCourses.values()) {
          if (enrolledCourse == courseId) {
            return true;
          };
        };
        false;
      };
      case (null) { false };
    };
  };

  public shared ({ caller }) func createCourse(course : Course, providedAdminKey : Text) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can create courses");
    };

    switch (adminKey) {
      case (?storedKey) {
        if (storedKey != providedAdminKey) {
          Runtime.trap("Unauthorized: Invalid admin key");
        };
      };
      case (null) {
        Runtime.trap("Admin key not configured");
      };
    };

    courses.add(course.id, course);
  };

  public shared ({ caller }) func createCourseWithoutAdminKey(course : Course) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can create courses");
    };
    courses.add(course.id, course);
  };

  public query ({ caller }) func getCourse(id : Text) : async Course {
    switch (courses.get(id)) {
      case (?course) { course };
      case (null) { Runtime.trap("Course not found") };
    };
  };

  public query ({ caller }) func getAllCourses() : async [Course] {
    courses.values().toArray();
  };

  public query ({ caller }) func getFreeCourses() : async [Course] {
    courses.values().filter(func(c) { c.isFree }).toArray();
  };

  public query ({ caller }) func getPaidCourses() : async [Course] {
    courses.values().filter(func(c) { not c.isFree }).toArray();
  };

  public query ({ caller }) func getVideoContent(videoId : Text) : async Video {
    for ((courseId, course) in courses.entries()) {
      for (video in course.videos.values()) {
        if (video.id == videoId) {
          if (video.isPaid and not course.isFree) {
            if (not isUserEnrolledInCourse(caller, courseId) and not AccessControl.isAdmin(accessControlState, caller)) {
              Runtime.trap("Unauthorized: Must be enrolled to access paid video content");
            };
          };
          return video;
        };
      };
    };
    Runtime.trap("Video not found");
  };

  public query ({ caller }) func getCourseVideos(courseId : Text) : async [Video] {
    switch (courses.get(courseId)) {
      case (?course) {
        if (not course.isFree) {
          if (not isUserEnrolledInCourse(caller, courseId) and not AccessControl.isAdmin(accessControlState, caller)) {
            Runtime.trap("Unauthorized: Must be enrolled to access paid course videos");
          };
        };
        course.videos;
      };
      case (null) { [] };
    };
  };

  public shared ({ caller }) func enrollInCourse(courseId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can enroll in courses");
    };

    let course = switch (courses.get(courseId)) {
      case (?c) { c };
      case (null) { Runtime.trap("Course not found") };
    };

    if (not course.isFree) {
      Runtime.trap("Course requires payment");
    };

    // Check for duplicate enrollment
    if (isUserEnrolledInCourse(caller, courseId)) {
      Runtime.trap("Already enrolled in this course");
    };

    let enrollment : Enrollment = {
      userId = caller;
      courseId;
      enrolledAt = Time.now();
      progress = 0;
      completedVideos = [];
      liveClassesAttended = [];
    };

    let existing = switch (courseEnrollments.get(courseId)) {
      case (?list) { list };
      case (null) { List.empty<Enrollment>() };
    };

    existing.add(enrollment);
    courseEnrollments.add(courseId, existing);

    // Update user enrollments
    let userCourses = switch (userEnrollments.get(caller)) {
      case (?list) { list };
      case (null) { List.empty<Text>() };
    };
    userCourses.add(courseId);
    userEnrollments.add(caller, userCourses);
  };

  public shared ({ caller }) func updateVideoProgress(videoId : Text, progress : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update video progress");
    };

    // Find the course for this video and verify enrollment
    var foundCourse : ?Text = null;
    for ((courseId, course) in courses.entries()) {
      for (video in course.videos.values()) {
        if (video.id == videoId) {
          foundCourse := ?courseId;
        };
      };
    };

    switch (foundCourse) {
      case (?courseId) {
        if (not isUserEnrolledInCourse(caller, courseId)) {
          Runtime.trap("Unauthorized: Must be enrolled in course to update video progress");
        };
      };
      case (null) {
        Runtime.trap("Video not found");
      };
    };

    let videoProgressRecord : VideoProgress = {
      userId = caller;
      videoId;
      progress;
      lastWatched = Time.now();
    };

    let existing = switch (videoProgress.get(caller)) {
      case (?list) { list };
      case (null) { List.empty<VideoProgress>() };
    };

    existing.add(videoProgressRecord);
    videoProgress.add(caller, existing);
  };

  public shared ({ caller }) func submitReview(review : Review) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can submit reviews");
    };

    if (not isUserEnrolledInCourse(caller, review.courseId)) {
      Runtime.trap("Unauthorized: Must be enrolled in course to submit a review");
    };

    if (review.userId != caller) {
      Runtime.trap("Unauthorized: Cannot submit review for another user");
    };

    let existing = switch (reviews.get(review.courseId)) {
      case (?list) { list };
      case (null) { List.empty<Review>() };
    };

    existing.add(review);
    reviews.add(review.courseId, existing);
  };

  public shared ({ caller }) func addInstructor(instructor : Instructor, providedAdminKey : Text) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can add instructors");
    };

    switch (adminKey) {
      case (?storedKey) {
        if (storedKey != providedAdminKey) {
          Runtime.trap("Unauthorized: Invalid admin key");
        };
      };
      case (null) {
        Runtime.trap("Admin key not configured");
      };
    };

    instructors.add(instructor.id, instructor);
  };

  public query ({ caller }) func getInstructor(id : Text) : async ?Instructor {
    instructors.get(id);
  };

  public query ({ caller }) func getAllInstructors() : async [Instructor] {
    instructors.values().toArray();
  };

  public shared ({ caller }) func scheduleLiveClass(liveClass : LiveClass, providedAdminKey : Text) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can schedule live classes");
    };

    switch (adminKey) {
      case (?storedKey) {
        if (storedKey != providedAdminKey) {
          Runtime.trap("Unauthorized: Invalid admin key");
        };
      };
      case (null) {
        Runtime.trap("Admin key not configured");
      };
    };

    let category = switch (liveClasses.get(liveClass.courseId)) {
      case (null) { List.empty<LiveClass>() };
      case (?classes) { classes };
    };

    category.add(liveClass);
    liveClasses.add(liveClass.courseId, category);
  };

  var stripeConfig : ?Stripe.StripeConfiguration = null;

  public shared ({ caller }) func setStripeConfiguration(config : Stripe.StripeConfiguration) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can set Stripe config");
    };
    stripeConfig := ?config;
  };

  public query ({ caller }) func isStripeConfigured() : async Bool {
    stripeConfig != null;
  };

  func getStripeConfig() : Stripe.StripeConfiguration {
    switch (stripeConfig) {
      case (null) { Runtime.trap("Stripe needs to be first configured") };
      case (?value) { value };
    };
  };

  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  public shared ({ caller }) func createCheckoutSession(items : [Stripe.ShoppingItem], successUrl : Text, cancelUrl : Text) : async Text {
    await Stripe.createCheckoutSession(getStripeConfig(), caller, items, successUrl, cancelUrl, transform);
  };

  public shared ({ caller }) func getStripeSessionStatus(sessionId : Text) : async Stripe.StripeSessionStatus {
    await Stripe.getSessionStatus(getStripeConfig(), sessionId, transform);
  };

  public shared ({ caller }) func processCoursePayment(providerId : Text, courseId : Text, stripeSessionId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can process payments");
    };

    let course = switch (courses.get(courseId)) {
      case (?c) { c };
      case (null) { Runtime.trap("Course not found") };
    };

    let sessionStatus = await Stripe.getSessionStatus(getStripeConfig(), stripeSessionId, transform);
    switch (sessionStatus) {
      case (#completed(_)) { () };
      case (#failed(_)) { Runtime.trap("Payment not completed") };
    };

    if (isUserEnrolledInCourse(caller, courseId)) {
      Runtime.trap("Already enrolled in this course");
    };

    let transaction : Transaction = {
      id = generateId();
      userId = caller;
      providerId = ?providerId;
      courseId;
      amount = course.price;
      stripeSessionId;
      status = "completed";
      createdAt = Time.now();
    };

    let existing = switch (coursePayments.get(courseId)) {
      case (?list) { list };
      case (null) { List.empty<Transaction>() };
    };

    existing.add(transaction);
    coursePayments.add(courseId, existing);

    let enrollment : Enrollment = {
      userId = caller;
      courseId;
      enrolledAt = Time.now();
      progress = 0;
      completedVideos = [];
      liveClassesAttended = [];
    };

    let enrollmentList = switch (courseEnrollments.get(courseId)) {
      case (?list) { list };
      case (null) { List.empty<Enrollment>() };
    };

    enrollmentList.add(enrollment);
    courseEnrollments.add(courseId, enrollmentList);

    let userCourses = switch (userEnrollments.get(caller)) {
      case (?list) { list };
      case (null) { List.empty<Text>() };
    };
    userCourses.add(courseId);
    userEnrollments.add(caller, userCourses);
  };

  func generateId() : Text {
    Time.now().toText();
  };

  public query ({ caller }) func filterCoursesByCategory(category : Text) : async [Course] {
    courses.values().filter(func(c) { c.category == category }).toArray();
  };

  public query ({ caller }) func filterCoursesByDifficulty(difficulty : Text) : async [Course] {
    courses.values().filter(func(c) { c.difficulty == difficulty }).toArray();
  };

  public query ({ caller }) func getUpcomingLiveClasses() : async [LiveClass] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view upcoming live classes");
    };

    let enrolledCourses = switch (userEnrollments.get(caller)) {
      case (?courses) { courses };
      case (null) { Runtime.trap("User is not enrolled in any courses") };
    };

    let resultArray = List.empty<LiveClass>();
    for ((courseId, classes) in liveClasses.entries()) {
      var isEnrolled = false;
      for (id in enrolledCourses.values()) {
        if (id == courseId) {
          isEnrolled := true;
        };
      };

      if (isEnrolled) {
        for (liveClass in classes.values()) {
          if (liveClass.startTime > Time.now() and liveClass.startTime < (Time.now() + 1209600000000000)) {
            resultArray.add(liveClass);
          };
        };
      };
    };

    resultArray.toArray();
  };

  public query ({ caller }) func getCourseReviews(courseId : Text) : async [Review] {
    switch (reviews.get(courseId)) {
      case (?reviews) { reviews.toArray() };
      case (null) { [] };
    };
  };

  public query ({ caller }) func getCourseAverageRating(courseId : Text) : async ?Float {
    let courseReviews = switch (reviews.get(courseId)) {
      case (?reviews) { reviews };
      case (null) { return null };
    };

    if (courseReviews.size() == 0) { return null };

    var sum = 0;
    for (review in courseReviews.values()) {
      sum += review.rating;
    };

    ?(sum.toFloat() / courseReviews.size().toFloat());
  };

  public shared ({ caller }) func completeVideo(videoId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can complete videos");
    };

    var foundCourse : ?Text = null;
    for ((courseId, course) in courses.entries()) {
      for (video in course.videos.values()) {
        if (video.id == videoId) {
          foundCourse := ?courseId;
        };
      };
    };

    switch (foundCourse) {
      case (?courseId) {
        if (not isUserEnrolledInCourse(caller, courseId)) {
          Runtime.trap("Unauthorized: Must be enrolled in course to complete videos");
        };
      };
      case (null) {
        Runtime.trap("Video not found");
      };
    };

    let existing = switch (videoProgress.get(caller)) {
      case (?progressList) { progressList };
      case (null) { List.empty<VideoProgress>() };
    };

    let video = {
      userId = caller;
      videoId;
      progress = 100;
      lastWatched = Time.now();
    };

    existing.add(video);
    videoProgress.add(caller, existing);
  };

  public query ({ caller }) func getMyEnrolledCourses() : async [Course] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view enrolled courses");
    };

    let enrolledCourseIds = switch (userEnrollments.get(caller)) {
      case (?list) { list };
      case (null) { return [] };
    };

    let resultArray = List.empty<Course>();
    for (courseId in enrolledCourseIds.values()) {
      switch (courses.get(courseId)) {
        case (?course) {
          resultArray.add(course);
        };
        case (null) { () };
      };
    };
    resultArray.toArray();
  };
};
