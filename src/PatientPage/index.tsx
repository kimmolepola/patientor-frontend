import React from 'react';
import { useParams } from 'react-router-dom';
import { useStateValue, updatePatient, addEntry } from "../state";
import axios from "axios";
import { apiBaseUrl } from "../constants";
import { Patient, Entry, HealthCheckRatingColor } from '../types';
import { Icon, Segment, Button } from 'semantic-ui-react';
import { EntryFormValues } from "../AddEntryModal/AddEntryForm";
import AddEntryModal from "../AddEntryModal";



const assertNever = (value: never): never => {
    throw new Error(
        `Unhandled discriminated union member: ${JSON.stringify(value)}`
    );
};

const EntryComponent: React.FC<{ entry: Entry }> = ({ entry }) => {
    const [{ diagnoses },] = useStateValue();
    const { type, date, description, diagnosisCodes, id } = entry;

    const clr: HealthCheckRatingColor[] = ["green", "yellow", "red", "black"];


    switch (type) {
        case "HealthCheck":
            return (
                <Segment>
                    <div><b>{date}</b> <Icon name='doctor' size='big' /></div>
                    <div><i style={{ color: 'gray' }}>{description}</i></div>
                    <ul>{diagnosisCodes?.map(x => <li key={id + x}>{x} {diagnoses[x] ? diagnoses[x].name : ""}</li>)}</ul>
                    <div>{"healthCheckRating" in entry ? <Icon name='heart' color={clr[entry.healthCheckRating]} /> : ""}</div>
                    <div>Specialist: {entry.specialist}</div>
                </Segment>
            );
        case "Hospital":
            return (
                <Segment>
                    <div><b>{date}</b> <Icon name='hospital' size='big' /></div>
                    <div><i style={{ color: 'gray' }}>{description}</i></div>
                    <ul>{diagnosisCodes?.map(x => <li key={id + x}>{x} {diagnoses[x] ? diagnoses[x].name : ""}</li>)}</ul>
                    <div>{"discharge" in entry ? "Discharge date: " + entry.discharge.date : ""}</div>
                    <div>{"discharge" in entry ? "Discharge criteria: " + entry.discharge.criteria : ""}</div>
                    <div>Specialist: {entry.specialist}</div>
                </Segment>
            );
        case "OccupationalHealthcare":
            return (
                <Segment>
                    <div><b>{date}</b> <Icon name='stethoscope' size='big' /><b>{"employerName" in entry ? entry.employerName : ""}</b></div>
                    <div><i style={{ color: 'gray' }}>{description}</i></div>
                    <ul>{diagnosisCodes?.map(x => <li key={id + x}>{x} {diagnoses[x] ? diagnoses[x].name : ""}</li>)}</ul>
                    <div>{"sickLeave" in entry ? "Sick leave: " + entry.sickLeave?.startDate + " - " + entry.sickLeave?.endDate : ""}</div>
                    <div>Specialist: {entry.specialist}</div>
                </Segment>
            );
        default:
            return assertNever(type);
    }
};

const Entries: React.FC<Patient> = ({ entries }) => {
    if (!entries || entries.length === 0) {
        return <div></div>;
    }
    return (
        <div>
            {entries.map(x => <EntryComponent key={x.id} entry={x} />)}
        </div>
    );
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any 
const isPatient = (object: any): object is Patient => {
    return (
        object !== undefined
        && object.id !== undefined
        && object.name !== undefined
        && object.occupation !== undefined
        && object.gender !== undefined
    );
};

const PatientPage: React.FC = () => {
    const [, dispatch] = useStateValue();
    const [{ patients },] = useStateValue();
    const { id } = useParams<{ id: string }>();
    //let patient = Object.values(patients).find((x) => x.id === id);
    let patient = patients[id];

    if (!patient || !patient.dateOfBirth || !patient.ssn || !patient.entries) {
        try {
            axios.get<Patient>(`${apiBaseUrl}/patients/${id}`).then(response => {
                //dispatch({ type: "UPDATE_PATIENT", payload: response.data });
                dispatch(updatePatient(response.data));
                patient = response.data;
            });
        } catch (err) {
            console.error(err);
        }
    }

    const [modalOpen, setModalOpen] = React.useState<boolean>(false);
    const [error, setError] = React.useState<string | undefined>();

    const openModal = (): void => setModalOpen(true);

    const closeModal = (): void => {
        setModalOpen(false);
        setError(undefined);
    };

    const submitNewEntry = async (values: EntryFormValues) => {
        try {
            const { data: newEntry } = await axios.post<Entry>(
                `${apiBaseUrl}/patients/${id}/entries`,
                values
            );
            //dispatch({ type: "ADD_PATIENT", payload: newPatient });
            dispatch(addEntry(patient, newEntry));
            closeModal();
        } catch (e) {
            console.error(e.response.data);
            setError(e.response.data.error);
        }
    };


    if (!isPatient(patient)) { return <div></div>; }

    return (
        <div>
            <h1>
                {patient?.name} {patient?.gender === "female" ? <Icon name="venus" /> : (patient?.gender === "male" ? <Icon name="mars" /> : <Icon name="other gender horizontal" />)}
            </h1>
            <div>
                ssn: {patient?.ssn}
            </div>
            <div>
                occupation: {patient?.occupation}
            </div>
            <h2>
                entries
            </h2>
            <div>
                <Entries {...patient} />
            </div>
            <AddEntryModal
                modalOpen={modalOpen}
                onSubmit={submitNewEntry}
                error={error}
                onClose={closeModal}
            />
            <Button onClick={() => openModal()}>Add New Entry</Button>
        </div >
    );
};

export default PatientPage;