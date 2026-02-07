import List "mo:core/List";
import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Int "mo:core/Int";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import Iter "mo:core/Iter";
import Migration "migration";

(with migration = Migration.run)
actor {
  // Authorization setup
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public type Source = {
    title : Text;
    url : Text;
    excerpt : Text;
  };

  public type Response = {
    summarizedAnswer : Text;
    sources : [Source];
  };

  public type QueryEntry = {
    question : Text;
    timestamp : Int;
    response : Response;
  };

  public type ConversationSummary = {
    id : Nat;
    title : Text;
    lastUpdated : Int;
  };

  public type Conversation = {
    title : Text;
    entries : List.List<QueryEntry>;
    lastUpdated : Int;
  };

  public type UserProfile = {
    name : Text;
  };

  public type ExportData = {
    profile : ?UserProfile;
    conversations : [ExportConversation];
  };

  public type ExportConversation = {
    id : Nat;
    title : Text;
    lastUpdated : Int;
    entries : [QueryEntry];
  };

  let userConversations = Map.empty<Principal, Map.Map<Nat, Conversation>>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  // User Profile Management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
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

  // Conversation History Management
  public shared ({ caller }) func createConversation(title : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can create conversations");
    };
    let idInt = Time.now();
    if (idInt < 0) { Runtime.trap("Negative Conversation ID not allowed") };
    let conversationId = idInt.toNat();

    let newConversation : Conversation = {
      title;
      entries = List.empty<QueryEntry>();
      lastUpdated = Time.now();
    };

    switch (userConversations.get(caller)) {
      case (?convMap) {
        convMap.add(conversationId, newConversation);
      };
      case (null) {
        let newConvMap = Map.empty<Nat, Conversation>();
        newConvMap.add(conversationId, newConversation);
        userConversations.add(caller, newConvMap);
      };
    };
    conversationId;
  };

  public query ({ caller }) func listConversations() : async [ConversationSummary] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can list conversations");
    };
    switch (userConversations.get(caller)) {
      case (?convMap) {
        convMap.toArray().map<(Nat, Conversation), ConversationSummary>(
          func((id, conversation)) {
            {
              id;
              title = conversation.title;
              lastUpdated = conversation.lastUpdated;
            };
          }
        );
      };
      case (null) { [] };
    };
  };

  public query ({ caller }) func getConversationEntries(conversationId : Nat) : async [QueryEntry] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can access conversation entries");
    };
    switch (userConversations.get(caller)) {
      case (?convMap) {
        switch (convMap.get(conversationId)) {
          case (?conversation) {
            conversation.entries.values().toArray();
          };
          case (null) { [] };
        };
      };
      case (null) { [] };
    };
  };

  public shared ({ caller }) func addQueryEntry(conversationId : Nat, question : Text, response : Response, title : ?Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can add entries");
    };
    let entry : QueryEntry = {
      question;
      timestamp = Time.now();
      response;
    };

    switch (userConversations.get(caller)) {
      case (?convMap) {
        switch (convMap.get(conversationId)) {
          case (?existingConversation) {
            if (existingConversation.entries.size() == 0) {
              let updatedConversation = {
                existingConversation with
                title = switch (title) {
                  case (?providedTitle) { providedTitle };
                  case (null) { existingConversation.title };
                };
                lastUpdated = Time.now();
              };
              convMap.add(conversationId, updatedConversation);
            };
            existingConversation.entries.add(entry);
            let updatedConversation = {
              existingConversation with lastUpdated = Time.now()
            };
            convMap.add(conversationId, updatedConversation);
          };
          case (null) {
            Runtime.trap("Conversation not found");
          };
        };
      };
      case (null) {
        Runtime.trap("No conversations found for user");
      };
    };
  };

  public shared ({ caller }) func deleteConversationHistory(conversationId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can delete conversation history");
    };
    switch (userConversations.get(caller)) {
      case (?convMap) {
        convMap.remove(conversationId);
      };
      case (null) {};
    };
  };

  public query ({ caller }) func exportUserData() : async ExportData {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can export data");
    };

    let profile = userProfiles.get(caller);
    let conversations = switch (userConversations.get(caller)) {
      case (?convMap) {
        convMap.toArray().map(
          func((id, conversation)) {
            {
              id;
              title = conversation.title;
              lastUpdated = conversation.lastUpdated;
              entries = conversation.entries.toArray();
            };
          }
        );
      };
      case (null) { [] };
    };

    {
      profile;
      conversations;
    };
  };
};
