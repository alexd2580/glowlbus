import * as React from "react";
import { Accordion, Button, Card, DropdownItemProps, Form, Icon } from "semantic-ui-react";
import * as R from "ramda";
import { map } from "rxjs";

import { owlFile } from "../models/owl-file";

import { useObservable, useObservableWithDefault } from "../utils/use-observable";
import { listAsOptions } from "../utils/list";
import { ID } from "../utils/id";
import { Condition } from "../models/interfaces";
import { SearchAddDropdown } from "./search-add-dropdown";
import { Input } from "./input";

function disableOption(option: string, options: DropdownItemProps[]): DropdownItemProps[] {
    return options.map(R.when(x => x.value === option, x => ({ ...x, disabled: true })));
}

type BuiltinDropdownProps = {
    showLabels?: boolean,
    disableExactly?: boolean,
    value?: string
    onChange: (value: string) => void,
};
const BuiltinDropdown = ({ showLabels, disableExactly, value, onChange }: BuiltinDropdownProps) => {
    const options = useObservable(owlFile.builtins.keys().pipe(map(listAsOptions)));
    const filteredOptions = disableExactly ? disableOption("exactly", options) : options;
    const addBuiltin = (value: string) => owlFile.builtins.add(value);
    return (
        <SearchAddDropdown
            fluid
            width={5}
            label={showLabels && "Builtin"}
            placeholder="Builtin..."
            options={filteredOptions}
            value={value ?? ""}
            onAddItem={addBuiltin}
            onChange={onChange}
        />
    );
};

type ConditionFormProps = { id: ID<"Condition">, datavalueId: ID<"Datavalue">, showLabels: boolean };
const ConditionForm = ({ id, datavalueId, showLabels }: ConditionFormProps) => {
    const { builtin, value } = useObservable(owlFile.conditions.byId(id));
    const disableExactly = useObservable(owlFile.datavalues.byId(datavalueId).pipe(
        map(datavalue => datavalue.conditionIds.length > 1),
    ));

    const setBuiltin = (value: string) => owlFile.conditions.setField(id, "builtin", value);
    const setValue = (value: string) => owlFile.conditions.setField(id, "value", value)
    const removeCondition = () => owlFile.removeCondition(id, datavalueId);

    return (
        <Form size="tiny">
            <Form.Group>
                <BuiltinDropdown
                    showLabels={showLabels}
                    disableExactly={disableExactly}
                    value={builtin}
                    onChange={setBuiltin}
                />
                <Input
                    fluid
                    width={3}
                    label={showLabels && "Value"}
                    placeholder='Value...'
                    value={value}
                    onChange={setValue}
                />
                <Form.Button
                    label={showLabels && "Remove"}
                    size="small"
                    icon='x'
                    color="red"
                    onClick={removeCondition}
                />
            </Form.Group>
        </Form>
    );
};

type AddConditionFormProps = { datavalueId: ID<"Datavalue">, showLabels: boolean };
const AddConditionForm = ({ datavalueId, showLabels }: AddConditionFormProps) => {
    const addCondition = (builtin: string, value: string) => {
        if (builtin !== "" || value !== "") {
            owlFile.addCondition(datavalueId, { builtin, value })
        }
    };
    return (
        <Form size="tiny">
            <Form.Group>
                <BuiltinDropdown
                    showLabels={showLabels}
                    onChange={(value) => addCondition(value, "")}
                />
                <Input
                    fluid
                    width={3}
                    label={showLabels && "Value"}
                    placeholder='Value...'
                    onBlur={(value) => addCondition("", value)}
                />
            </Form.Group>
        </Form>
    );
};

const DatavalueAccordionItem = ({ id, objektId }: { id: ID<"Datavalue">, objektId: ID<"Objekt"> }) => {
    const { field, instance, conditionIds } = useObservable(owlFile.datavalues.byId(id));
    const conditions = useObservable(owlFile.datavalueConditions(id));
    const isExactly = conditions.length === 1 && conditions[0].builtin === "exactly";
    const options = useObservable(owlFile.datavalueOptions(objektId).pipe(map(listAsOptions)));

    const accordionActive = useObservableWithDefault(owlFile.datavaluesExpanded.byId(id), false);
    const variablePart = `${field ?? "***"}(${instance ?? "***"})`;
    const stringifyCondition = (condition: Condition) => `${condition.builtin ?? "***"}(${condition.value})`;
    const conditionPart = R.join(" && ", conditions.map(stringifyCondition));
    let accordionTitle = `${variablePart} ${!R.isEmpty(conditions) ? "| " + conditionPart : ""}`;

    const addField = (value: string) => owlFile.addDatavalueOption(objektId, value);
    const setField = (value: string) => owlFile.datavalues.setField(id, "field", value);
    const setInstance = (value: string) => owlFile.datavalues.setField(id, "instance", value);
    const removeDatavalue = () => owlFile.removeDatavalue(id, objektId);
    const toggleAccordion = () => owlFile.datavaluesExpanded.alter(id, prev => !prev);

    return (
        <>
            <Accordion.Title
                active={accordionActive}
                index={id}
                onClick={toggleAccordion}
            >
                <Icon name='dropdown' />{accordionTitle}
            </Accordion.Title>
            <Accordion.Content active={accordionActive}>
                <Form size="small">
                    <Form.Group>
                        <SearchAddDropdown
                            fluid
                            width={5}
                            label="Datavalue"
                            placeholder="Datavalue..."
                            options={options}
                            value={field}
                            onAddItem={addField}
                            onChange={setField}
                        />
                        <Input
                            fluid
                            width={3}
                            label="Variable"
                            iconPosition='left'
                            icon="edit"
                            placeholder="Variable name..."
                            value={instance}
                            onChange={setInstance}
                            disabled={isExactly}
                        />
                        <Form.Button label="Remove" icon='x' color="red" onClick={removeDatavalue} />
                    </Form.Group>
                </Form >
                {conditionIds.map((cId, index) =>
                    <ConditionForm
                        key={cId}
                        id={cId}
                        datavalueId={id}
                        showLabels={index === 0}
                    />
                )}
                {!isExactly &&
                    <AddConditionForm
                        key={conditionIds.length}
                        datavalueId={id}
                        showLabels={R.isEmpty(conditionIds)}
                    />
                }
            </Accordion.Content >
        </>
    );
};

export const ObjektCard = ({ id, ruleId }: { id: ID<"Objekt">, ruleId: ID<"Rule"> }) => {
    const { name, klass, datavalueIds } = useObservable(owlFile.objekts.byId(id));
    const options = useObservable(owlFile.klasses.keys().pipe(map(listAsOptions)));
    const setName = (value: string) => owlFile.objekts.setField(id, "name", value);
    const setKlass = (value: string) => owlFile.objekts.setField(id, "klass", value);
    const addDatavalue = () => owlFile.addDatavalue(id);
    const removeObjekt = () => owlFile.removeObjekt(id, ruleId);
    const setObjektHover = () => owlFile.hoveredObjekt.next(id);
    return (
        <Card
            style={{ width: "100%" }}
            onFocus={setObjektHover}
            onMouseEnter={setObjektHover}
        >
            {/* Generic objekt data. */}
            <Card.Content>
                <Form size="large">
                    <Form.Group style={{ margin: "0" }}>
                        <Form.Dropdown
                            fluid
                            width={5}
                            placeholder="Class..."
                            search
                            selection
                            options={options}
                            value={klass}
                            onChange={(_, data) => setKlass(data.value as string)}
                        />
                        <Input
                            fluid
                            width={5}
                            placeholder="Variable..."
                            value={name}
                            onChange={setName}
                        />
                    </Form.Group>
                </Form>
            </Card.Content>

            <Card.Content>
                {/* Objekt datavalues. */}
                <Accordion>
                    {datavalueIds.map(dId => <DatavalueAccordionItem key={dId} id={dId} objektId={id} />)}
                </Accordion>
            </Card.Content>

            <Card.Content extra>
                <Form.Field>
                    <Button.Group>
                        <Button icon="add" color="blue" content="Add datavalue" onClick={addDatavalue} />
                        <Button icon="x" color="red" content="Remove object" onClick={removeObjekt} />
                    </Button.Group>
                </Form.Field>
            </Card.Content>
        </Card>
    );
};
