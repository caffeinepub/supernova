import Map "mo:core/Map";
import Principal "mo:core/Principal";
import List "mo:core/List";
import Int "mo:core/Int";
import Blob "blob-storage/Storage";

module {
  public type Source = {
    title : Text;
    url : Text;
    excerpt : Text;
  };

  public type Response = {
    summarizedAnswer : Text;
    sources : [Source];
  };

  public type BlobRef = {
    id : Text;
    blob : Blob.ExternalBlob;
  };

  public type OldQueryEntry = {
    question : Text;
    timestamp : Int;
    response : Response;
    // No photo field in the old version.
  };

  public type NewQueryEntry = {
    question : Text;
    timestamp : Int;
    response : Response;
    photo : ?BlobRef;
  };

  public type OldConversation = {
    title : Text;
    entries : List.List<OldQueryEntry>;
    lastUpdated : Int;
  };

  public type NewConversation = {
    title : Text;
    entries : List.List<NewQueryEntry>;
    lastUpdated : Int;
  };

  public type UserProfile = {
    name : Text;
  };

  public type OldActor = {
    userConversations : Map.Map<Principal, Map.Map<Nat, OldConversation>>;
    userProfiles : Map.Map<Principal, UserProfile>;
  };

  public type NewActor = {
    userConversations : Map.Map<Principal, Map.Map<Nat, NewConversation>>;
    userProfiles : Map.Map<Principal, UserProfile>;
  };

  public func run(old : OldActor) : NewActor {
    let newUserConversations = old.userConversations.map<Principal, Map.Map<Nat, OldConversation>, Map.Map<Nat, NewConversation>>(
      func(_principal, oldConversationMap) {
        oldConversationMap.map<Nat, OldConversation, NewConversation>(
          func(_id, oldConversation) {
            let newEntries = oldConversation.entries.map<OldQueryEntry, NewQueryEntry>(
              func(oldEntry) {
                {
                  oldEntry with
                  photo = null;
                };
              }
            );
            {
              oldConversation with entries = newEntries;
            };
          }
        );
      }
    );

    {
      old with
      userConversations = newUserConversations;
    };
  };
};
