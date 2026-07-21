import "./CurrentInterventionPage.scss";

import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Send from "@mui/icons-material/Send";
import { useNavigate } from "react-router-dom";

import BooleanInput from "../../components/currentIntervention/booleanInput/BooleanInput";
import InfrastructureInput from "../../components/currentIntervention/infrastructureInput/InfrastructureInput";
import NetworkInput from "../../components/currentIntervention/networkInput/NetworkInput";
import StatusInput from "../../components/currentIntervention/status/StatusInput";
import InputsAll from "../../components/currentIntervention/inputsAll/InputsAll";
import ClientsOnAddress from "../../components/currentIntervention/clientsOnAddress/ClientsOnAddress";

import { useAppDispatch, useAppSelector } from "../../redux/store";
import { updateField } from "../../redux/features/newInterventionSlice";
import { createInterventionThunk } from "../../redux/thunks/createInterventionThunk";
import { updateInterventionThunk } from "../../redux/thunks/updateInterventionThunk";

import { ReactComponent as LightBulbOnIcon } from "../../assets/svg/Light bulb on.svg.tsx";
import { ReactComponent as LightBulbOffIcon } from "../../assets/svg/Light bulb off.svg.tsx";
import { ReactComponent as SnowOnIcon } from "../../assets/svg/Snow on.svg.tsx";
import { ReactComponent as SnowOffIcon } from "../../assets/svg/Snow off.svg.tsx";
import { ReactComponent as QuestionMarkOnIcon } from "../../assets/svg/Question mark on.svg.tsx";
import { ReactComponent as QuestionMarkOffIcon } from "../../assets/svg/Question mark off.svg.tsx";
import { ReactComponent as AddressConfirmedIcon } from "../../assets/svg/Address confirmed.svg.tsx";
import { ReactComponent as AddressNotConfirmedIcon } from "../../assets/svg/Address not confirmed.svg.tsx";

const CurrentInterventionPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const newIntervention = useAppSelector(
    (state) => state.newIntervention,
  );

  const { clientName, comment, isEditing } = newIntervention;

  const submitActions = async () => {
    const result = isEditing
      ? await dispatch(
          updateInterventionThunk(newIntervention),
        )
      : await dispatch(
          createInterventionThunk(newIntervention),
        );

    const requestFailed =
      createInterventionThunk.rejected.match(result) ||
      updateInterventionThunk.rejected.match(result);

    if (requestFailed) {
      const message =
        typeof result.payload === "string"
          ? result.payload
          : result.error.message ||
            "L'intervention n'a pas pu être enregistrée.";

      window.alert(message);
      return;
    }

    navigate("/today");
  };

  return (
    <main className="current-intervention-page">
      <div className="current-intervention-layout">
        <section className="intervention-card left-card">
          <header className="card-header">
            <h1>
              {isEditing
                ? "Modifier l'intervention"
                : "Nouvelle intervention"}
            </h1>

            <span className="editing-badge">
              {isEditing ? "Modification" : "Création"}
            </span>
          </header>

          <div className="basic-info">
            <InfrastructureInput />
            <NetworkInput />
          </div>

          <div className="technical-inputs">
            <InputsAll />
          </div>

          <section className="intervention-options">
            <span className="options-title">
              Options de l'intervention
            </span>

            <div className="boolean-inputs-row">
              <div className="option-button">
                <BooleanInput
                  field="isSnow"
                  label="Ticket Snow ?"
                  trueIcon={<SnowOnIcon />}
                  falseIcon={<SnowOffIcon />}
                />
              </div>

              <div className="option-button">
                <BooleanInput
                  field="isUnclear"
                  label="Question à poser à l'M&P ?"
                  trueIcon={<QuestionMarkOnIcon />}
                  falseIcon={<QuestionMarkOffIcon />}
                />
              </div>

              <div className="option-button">
                <BooleanInput
                  field="isGoodExample"
                  label="Bon exemple à retenir ?"
                  trueIcon={<LightBulbOnIcon />}
                  falseIcon={<LightBulbOffIcon />}
                />
              </div>

              <div className="option-button">
                <BooleanInput
                  field="isAddressConfirmed"
                  label="Adresse confirmée ?"
                  trueIcon={<AddressConfirmedIcon />}
                  falseIcon={<AddressNotConfirmedIcon />}
                />
              </div>
            </div>
          </section>
        </section>

        <section className="intervention-card right-card">
          <div className="client-name-field">
            <TextField
              label="Nom du client"
              value={clientName}
              onChange={(event) =>
                dispatch(
                  updateField({
                    field: "clientName",
                    value: event.target.value,
                  }),
                )
              }
              fullWidth
            />
          </div>

          <div className="clients-address-field">
            <ClientsOnAddress />
          </div>

          <div className="comment-field">
            <TextField
              label="Commentaire"
              value={comment}
              onChange={(event) =>
                dispatch(
                  updateField({
                    field: "comment",
                    value: event.target.value,
                  }),
                )
              }
              multiline
              rows={7}
              fullWidth
            />
          </div>

          <footer className="right-card-actions">
            <div className="status-wrapper">
              <StatusInput />
            </div>

            <Button
              variant="contained"
              size="large"
              onClick={submitActions}
              startIcon={<Send />}
              className="submit-intervention-button"
            >
              {isEditing ? "Enregistrer" : "Envoyer"}
            </Button>
          </footer>
        </section>
      </div>
    </main>
  );
};

export default CurrentInterventionPage;