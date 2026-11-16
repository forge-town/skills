namespace FormalPrd

inductive Actor where
  | visitor | member | manager | administrator | operator | reviewer | system
  deriving DecidableEq, Repr

inductive Action where
  | view | create | edit | submit | approve | reject | publish | archive | retry | invite
  deriving DecidableEq, Repr

inductive Entity where
  | account | workspace | membership | issue | requirement | document | artifact | record
  | notification
  deriving DecidableEq, Repr

inductive Guard where
  | authenticated | authorized | validInput | targetExists | targetMissing | notDuplicate | ready
  deriving DecidableEq, Repr

inductive Outcome where
  | visible | persisted | notified | navigated | blocked | unchanged | completed
  deriving DecidableEq, Repr

inductive Surface where
  | page | dialog | menu | panel | list | detail | inbox | background
  deriving DecidableEq, Repr

inductive Control where
  | link | button | iconButton | form | selector | switch | systemEvent
  deriving DecidableEq, Repr

structure FormalPrd where
  actor : Actor
  action : Action
  entity : Entity
  guards : List Guard
  outcomes : List Outcome
  surface : Surface
  control : Control
  deriving DecidableEq, Repr

def WellFormed (prd : FormalPrd) : Prop :=
  prd.guards ≠ [] ∧ prd.outcomes ≠ [] ∧
    (prd.actor = .system ↔ prd.surface = .background ∧ prd.control = .systemEvent)

-- Replace this example with the Issue's canonical product semantics.
def canonicalPrd : FormalPrd := {
  actor := .administrator
  action := .invite
  entity := .membership
  guards := [.authenticated, .authorized, .validInput, .targetMissing, .notDuplicate]
  outcomes := [.persisted, .visible, .notified]
  surface := .page
  control := .form
}

theorem canonicalPrd_wellFormed : WellFormed canonicalPrd := by
  simp [WellFormed, canonicalPrd]

end FormalPrd
