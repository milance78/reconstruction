import "./InputsAll.scss";
import SimpleInput from "../simpleInput/SimpleInput";
import { ReactComponent as OAGIcon } from "../../../assets/svg/OAG.svg.tsx";
import { ReactComponent as NAIcon } from "../../../assets/svg/NA.svg.tsx";
import { ReactComponent as CIDIcon } from "../../../assets/svg/CID.svg.tsx";
import { ReactComponent as IDIcon } from "../../../assets/svg/ID.svg.tsx";
import Numbers from "@mui/icons-material/Numbers";
import { House } from "lucide-react";
import { TextInitial } from "lucide-react";
import { UserRound } from "lucide-react";
import { Contact } from "lucide-react";
import { KeyRound } from "lucide-react";
import { NotebookTabs } from "lucide-react";
import { PhoneCall } from "lucide-react";
const InputsAll = () => {
  return (
    <div className="inputs-all">
      <section className="inputs-row">
        <SimpleInput
          field="interventionId"
          label="ID de l'intervention"
          inputType="type2"
          icon={IDIcon}
        />
        <SimpleInput
          field="oagID"
          label="OAG ID"
          inputType="type2"
          icon={OAGIcon}
        />
      </section>
      <section className="inputs-row">
        <SimpleInput
          field="snowReference"
          label="Référence SNOW"
          inputType="type2"
          icon={Numbers}
        />
        <SimpleInput
          field="interventionDescription"
          label="Description d'intervention"
          icon={TextInitial}
          inputType="type2"
        />
      </section>
      <section className="inputs-row">
        <SimpleInput
          field="clientName"
          label="Nom du client"
          inputType="type2"
          icon={UserRound}
        />
        <SimpleInput
          field="clientID"
          label="ID client"
          inputType="type2"
          icon={Contact}
        />
      </section>
      <section className="inputs-row">
        <SimpleInput field="na" label="NA" inputType="type2" icon={NAIcon} />
        <SimpleInput field="cid" label="CID" inputType="type2" icon={CIDIcon} />
      </section>
      <section className="inputs-row">
        <SimpleInput
          field="mainAddress"
          label="Adresse principale"
          inputType="type2"
          icon={House}
        />
        <SimpleInput
          field="addressDetails"
          label="Détails d'adresse"
          inputType="type2"
          icon={NotebookTabs}
        />
      </section>
      <section className="inputs-row">
        <SimpleInput
          field="LOMKey"
          label="LOM key"
          inputType="type2"
          icon={KeyRound}
        />
        <SimpleInput
          field="phone"
          label="Nº de téléphone (GSM)"
          inputType="type2"
          icon={PhoneCall}
        />
      </section>
    </div>
  );
};
export default InputsAll;
