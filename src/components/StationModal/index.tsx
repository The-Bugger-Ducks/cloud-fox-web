import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import Button from "../../components/Button";
import { MinimapRef } from "../../interfaces/Minimap";
import { StationModalRef } from "../../interfaces/StationModalRef";
import Minimap from "../Minimap";
import StationRequests from "../../utils/Requests/station.request";
import Loading from "../Loading";
import { Container, Body, Main, Footer, Title, Questions, Label, Input, TextArea, LoadingContainer } from "./styles";
import { ActiveStationInterface } from "../../interfaces/station";
import { useNavigate } from "react-router-dom";
import ToastService from "../../utils/Toast/ToastService";
import { ToastContainer } from "react-toastify";

const StationModal = forwardRef<StationModalRef, { station?: ActiveStationInterface }>((props, ref) => {
	const [isDisabled, setIsDisabled] = useState<boolean>(true);
	const [nameStation, setNameStation] = useState<string>(props.station?.name ?? "");
	const [desriptionStation, setDescriptionStation] = useState<string>(props.station?.description ?? "");
	const [idStation, setIdStation] = useState<string>(props.station?.id ?? "");
	const minimapRef = useRef<MinimapRef>(null);
	const [isLoading, setIsloading] = useState<boolean>(false);
	const navigate = useNavigate();

	const closeModal = () => {
		setIsDisabled(true);
	};

	const createOrEditStation = async () => {
		setIsloading(true);
		const latLng: any = minimapRef.current?.getLatLng();

		if (latLng) {
			let response = props.station
				? await StationRequests.editStation(idStation, nameStation, latLng.lat, latLng.lng, desriptionStation)
				: await StationRequests.createStation(idStation, nameStation, latLng.lat, latLng.lng, desriptionStation);

			setIsloading(false);

			if (response !== "error") {
				let message = ""
				props.station ? message = "Estação atualizada com sucesso!" : message = "Estação cadastrada com sucesso!";

				ToastService.success({
					title: "Sucesso",
					message
				})

				closeModal();
				navigate("/dashboard/" + idStation);
			} else {
				let message = ""

				props.station ? message = "Não foi possível atualizar a estação" : message = "Não foi possível cadastrar a estação";

				ToastService.error({
					title: "Atenção",
					message
				})
			}

			closeModal();
		} else {
			ToastService.error({
				title: "Atenção",
				message: "Latitude e longitude inválida"
			})
		}
	};

	useImperativeHandle(ref, () => ({
		showModal: () => setIsDisabled(false),
	}));

	return (
		<>
			<ToastContainer />
			<Container disabled={isDisabled}>
				<LoadingContainer disabled={!isLoading}>
					<Loading width={250} height={250} />
				</LoadingContainer>
				<Body>
					<Title>{props.station ? "Editar" : "Cadastrar"} estação</Title>
					<Main>
						<Questions>
							<Label>MAC Address da estação</Label>
							<Input
								type="text"
								defaultValue={idStation}
								placeholder="Ex.: AAHBCUTOSHFE"
								disabled={props.station ? true : false}
								onChange={(event) => setIdStation(event.target.value)}
							/>

							<Label>Nome da estação</Label>
							<Input
								type="text"
								defaultValue={nameStation}
								placeholder="Ex.: Escola Fulano de Tal"
								onChange={(event) => setNameStation(event.target.value)}
							/>

							<Label>Descrição da estação</Label>
							<TextArea
								defaultValue={desriptionStation}
								placeholder="Ex.: Estação pluviométrica"
								onChange={(event) => setDescriptionStation(event.target.value)}
							/>

							<Label>Localização da estação</Label>
							<Minimap
								initialLocal={{
									lat: props.station ? props.station?.lat : 0,
									lng: props.station ? props.station?.lon : 0,
								}}
								ref={minimapRef}
							/>
						</Questions>
					</Main>
					<Footer>
						<Button width="45%" title="Cancelar" backgroundColor="#A0938C" onClick={() => closeModal()} />
						<Button width="45%" title={props.station ? "Editar" : "Cadastrar"} onClick={() => createOrEditStation()} />
					</Footer>
				</Body>
			</Container>
		</>
	);
});

export default StationModal;
