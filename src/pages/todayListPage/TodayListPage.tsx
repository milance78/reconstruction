import type { ElementType, ReactNode } from "react";
import Numbers from "@mui/icons-material/Numbers";
import {
  Contact,
  House,
  KeyRound,
  NotebookTabs,
  Pencil,
  PhoneCall,
  TextInitial,
  Trash2,
  UserRound,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import "./TodayListPage.scss";

import { ReactComponent as AddressConfirmedIcon } from "../../assets/svg/Address confirmed.svg.tsx";
import { ReactComponent as CIDIcon } from "../../assets/svg/CID.svg.tsx";
import { ReactComponent as IDIcon } from "../../assets/svg/ID.svg.tsx";
import { ReactComponent as LightBulbOnIcon } from "../../assets/svg/Light bulb on.svg.tsx";
import { ReactComponent as NAIcon } from "../../assets/svg/NA.svg.tsx";
import { ReactComponent as OAGIcon } from "../../assets/svg/OAG.svg.tsx";
import { ReactComponent as QuestionMarkOnIcon } from "../../assets/svg/Question mark on.svg.tsx";
import { ReactComponent as SnowOnIcon } from "../../assets/svg/Snow on.svg.tsx";

import { loadInterventionForEdit } from "../../redux/features/newInterventionSlice";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import { deleteInterventionThunk } from "../../redux/thunks/deleteInterventionThunk";

const hasValue = (value?: string | null): value is string =>
  Boolean(value?.trim());

const displayInfrastructure = (value: string) => {
  if (value === "copper") return "cuivre";
  if (value === "fiber") return "fibre";

  return value;
};

const displayNetwork = (value: string) => {
  if (value === "otherOlo") return "autre OLO";
  if (value === "mobileVikings") return "Mobile Vikings";

  return value;
};

const displayStatus = (value: string) => {
  const labels: Record<string, string> = {
    "on hold": "en attente",
    completed: "terminé",
    transferred: "transmis",
    "consult M&P": "voir avec M&P",
    "closed by another agent": "fermé par un autre agent",
  };

  return labels[value] ?? value;
};

const getStatusClass = (status?: string | null) => {
  if (!hasValue(status)) return "empty";

  return status
    .replace(/\s+/g, "-")
    .replace(/&/g, "")
    .toLowerCase();
};

const TodayBooleanIcon = ({ children }: { children: ReactNode }) => (
  <div className="today-boolean-icon">{children}</div>
);

type TodayIconValueProps = {
  value: string;
  icon: ElementType;
  large?: boolean;
};

const TodayIconValue = ({
  value,
  icon: Icon,
  large = false,
}: TodayIconValueProps) => (
  <div className="today-icon-field">
    <div
      className={`today-field-icon-box ${
        large ? "today-large-icon" : ""
      }`}
    >
      <Icon />
    </div>

    <span className="today-field-value">{value}</span>
  </div>
);

const TodayStackedField = ({
  label,
  value,
}: {
  label: string;
  value: string;
}) => (
  <div className="today-stacked-field">
    <div className="today-stacked-label">{label}</div>

    <div className="today-stacked-value">{value}</div>
  </div>
);

const TodayListPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const interventions = useAppSelector(
    (state) => state.interventionsList,
  );

  return (
    <main className="today-list-page">
      <div className="today-list-content">
        {interventions.map((intervention) => {
          const statusClass = getStatusClass(intervention.status);

          const hasCategories =
            hasValue(intervention.infrastructure) ||
            hasValue(intervention.network) ||
            hasValue(intervention.status);

          const hasFlags =
            intervention.isUnclear ||
            intervention.isAddressConfirmed ||
            intervention.isGoodExample ||
            intervention.isSnow;

          const hasIdentifiers =
            hasValue(intervention.interventionId) ||
            hasValue(intervention.na) ||
            hasValue(intervention.oagID) ||
            hasValue(intervention.clientName) ||
            hasValue(intervention.interventionDescription) ||
            hasValue(intervention.LOMKey) ||
            hasValue(intervention.mainAddress) ||
            hasValue(intervention.clientID) ||
            hasValue(intervention.cid) ||
            hasValue(intervention.phone) ||
            hasValue(intervention.addressDetails) ||
            hasValue(intervention.snowReference);

          const hasClientsOnAddress = hasValue(
            intervention.clientsOnAddress,
          );

          const hasComment = hasValue(intervention.comment);

          return (
            <article
              key={
                intervention.documentId ||
                intervention.interventionId
              }
              className={`today-intervention-row status-${statusClass}`}
            >
              <div className="today-intervention-actions">
                <button
                  type="button"
                  className="today-action-button today-edit-button"
                  aria-label="Modifier l'intervention"
                  title="Modifier"
                  onClick={() => {
                    dispatch(loadInterventionForEdit(intervention));
                    navigate("/intervention-en-cours");
                  }}
                >
                  <Pencil size={17} />
                </button>

                <button
                  type="button"
                  className="today-action-button today-delete-button"
                  aria-label="Supprimer l'intervention"
                  title="Supprimer"
                  onClick={() => {
                    if (!intervention.documentId) return;

                    dispatch(
                      deleteInterventionThunk(
                        intervention.documentId,
                      ),
                    );
                  }}
                >
                  <Trash2 size={17} />
                </button>
              </div>

              {(hasCategories || hasFlags) && (
                <div className="today-card-column today-category-column">
                  {hasCategories && (
                    <div className="today-category-section">
                      {hasValue(intervention.infrastructure) && (
                        <span className="today-badge today-infrastructure">
                          {displayInfrastructure(
                            intervention.infrastructure,
                          )}
                        </span>
                      )}

                      {hasValue(intervention.network) && (
                        <span className="today-badge today-network">
                          {displayNetwork(intervention.network)}
                        </span>
                      )}

                      {hasValue(intervention.status) && (
                        <span
                          className={`today-badge today-status status-${statusClass}`}
                        >
                          {displayStatus(intervention.status)}
                        </span>
                      )}
                    </div>
                  )}

                  {hasFlags && (
                    <div className="today-flags-section">
                      {intervention.isUnclear && (
                        <TodayBooleanIcon>
                          <QuestionMarkOnIcon />
                        </TodayBooleanIcon>
                      )}

                      {intervention.isAddressConfirmed && (
                        <TodayBooleanIcon>
                          <AddressConfirmedIcon />
                        </TodayBooleanIcon>
                      )}

                      {intervention.isGoodExample && (
                        <TodayBooleanIcon>
                          <LightBulbOnIcon />
                        </TodayBooleanIcon>
                      )}

                      {intervention.isSnow && (
                        <TodayBooleanIcon>
                          <SnowOnIcon />
                        </TodayBooleanIcon>
                      )}
                    </div>
                  )}
                </div>
              )}

              {hasIdentifiers && (
                <div className="today-card-column today-identifiers-column">
                  {hasValue(intervention.interventionId) && (
                    <TodayIconValue
                      value={intervention.interventionId}
                      icon={IDIcon}
                    />
                  )}

                  {hasValue(intervention.na) && (
                    <TodayIconValue
                      value={intervention.na}
                      icon={NAIcon}
                      large
                    />
                  )}

                  {hasValue(intervention.oagID) && (
                    <TodayIconValue
                      value={intervention.oagID}
                      icon={OAGIcon}
                      large
                    />
                  )}

                  {hasValue(intervention.clientName) && (
                    <TodayIconValue
                      value={intervention.clientName}
                      icon={UserRound}
                    />
                  )}

                  {hasValue(
                    intervention.interventionDescription,
                  ) && (
                    <TodayIconValue
                      value={
                        intervention.interventionDescription
                      }
                      icon={TextInitial}
                    />
                  )}

                  {hasValue(intervention.LOMKey) && (
                    <TodayIconValue
                      value={intervention.LOMKey}
                      icon={KeyRound}
                    />
                  )}

                  {hasValue(intervention.mainAddress) && (
                    <TodayIconValue
                      value={intervention.mainAddress}
                      icon={House}
                    />
                  )}

                  {hasValue(intervention.clientID) && (
                    <TodayIconValue
                      value={intervention.clientID}
                      icon={Contact}
                    />
                  )}

                  {hasValue(intervention.cid) && (
                    <TodayIconValue
                      value={intervention.cid}
                      icon={CIDIcon}
                      large
                    />
                  )}

                  {hasValue(intervention.phone) && (
                    <TodayIconValue
                      value={intervention.phone}
                      icon={PhoneCall}
                    />
                  )}

                  {hasValue(intervention.addressDetails) && (
                    <TodayIconValue
                      value={intervention.addressDetails}
                      icon={NotebookTabs}
                    />
                  )}

                  {hasValue(intervention.snowReference) && (
                    <TodayIconValue
                      value={intervention.snowReference}
                      icon={Numbers}
                    />
                  )}
                </div>
              )}

              {hasClientsOnAddress && (
                <div className="today-card-column today-text-column">
                  <TodayStackedField
                    label="Clients à l'adresse"
                    value={intervention.clientsOnAddress}
                  />
                </div>
              )}

              {hasComment && (
                <div className="today-card-column today-text-column">
                  <TodayStackedField
                    label="Commentaire"
                    value={intervention.comment}
                  />
                </div>
              )}
            </article>
          );
        })}

        {interventions.length === 0 && (
          <div className="today-empty">
            Aucune intervention disponible
          </div>
        )}
      </div>
    </main>
  );
};

export default TodayListPage;