import Map "mo:core/Map";
import List "mo:core/List";
import Principal "mo:core/Principal";

module {
  // Types from old actor
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
    response : Response;
  };

  public type Conversation = {
    queries : List.List<QueryEntry>;
  };

  public type UserProfile = {
    name : Text;
  };

  public type OldActor = {
    conversations : Map.Map<Principal, Conversation>;
    userProfiles : Map.Map<Principal, UserProfile>;
  };

  // Types for new actor
  public type NewQueryEntry = {
    question : Text;
    timestamp : Int; // new field
    response : Response;
  };

  public type NewConversation = {
    title : Text;
    entries : List.List<NewQueryEntry>;
    lastUpdated : Int;
  };

  public type NewActor = {
    userConversations : Map.Map<Principal, Map.Map<Nat, NewConversation>>;
    userProfiles : Map.Map<Principal, UserProfile>;
  };

  // Migration function
  public func run(old : OldActor) : NewActor {
    let newUserConversations = old.conversations.map<Principal, Conversation, Map.Map<Nat, NewConversation>>(
      func(_, oldConversation) {
        let newEntries = oldConversation.queries.map<QueryEntry, NewQueryEntry>(
          func(oldEntry) {
            { oldEntry with timestamp = 0 }; // Default value for migration
          }
        );

        let newConversation : NewConversation = {
          title = "";
          entries = newEntries;
          lastUpdated = 0; // Default value for migration
        };

        let newConvMap = Map.empty<Nat, NewConversation>();
        newConvMap.add(0, newConversation);
        newConvMap;
      }
    );

    {
      userConversations = newUserConversations;
      userProfiles = old.userProfiles;
    };
  };
};
