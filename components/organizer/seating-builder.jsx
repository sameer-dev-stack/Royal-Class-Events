"use client";

import { useState, useRef, useEffect } from "react";
import { Stage, Layer, Image as KonvaImage, Rect, Circle, Transformer, Group, Text } from "react-konva";
import useImage from "use-image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useConvexMutation, useConvexQuery } from "@/hooks/use-convex-query";
import { api } from "@/convex/_generated/api";
import { Upload, Plus, Save, Trash2, MousePointer2 } from "lucide-react";
import { toast } from "sonner";

// --- Image Uploader Component ---
const URLImage = ({ src, onLoaded }) => {
    const [image] = useImage(src);
    useEffect(() => {
        if (image && onLoaded) {
            onLoaded({ width: image.width, height: image.height });
        }
        // eslint-disable-next-line
    }, [image, onLoaded]); // Only trigger when image loads/changes
    return <KonvaImage image={image} listening={false} />;
};

export default function SeatingBuilder({ event }) {
    // --- State ---
    const [mapUrl, setMapUrl] = useState(event.seatMapConfig?.imageUrl || null);
    const [zones, setZones] = useState(event.seatMapConfig?.zones || []);
    const [selectedId, setSelectedId] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [stageSize, setStageSize] = useState({ width: 800, height: 600 });
    const [imageSize, setImageSize] = useState({ width: 0, height: 0 }); // Natural size

    // Sync mapUrl when event prop updates
    useEffect(() => {
        if (event.seatMapConfig?.imageUrl) {
            setMapUrl(event.seatMapConfig.imageUrl);
        } else {
            setMapUrl(null);
        }
    }, [event.seatMapConfig?.imageUrl]);
    // --- Refs ---
    const stageRef = useRef(null);
    const transformerRef = useRef(null);
    const fileInputRef = useRef(null);

    // --- Convex Mutations ---
    // --- Convex Mutations ---
    const { mutate: generateUploadUrl } = useConvexMutation(api.files.generateUploadUrl);
    const { mutate: updateEvent } = useConvexMutation(api.events.update);

    // --- Ticket Tiers Query ---
    const { data: ticketTiers } = useConvexQuery(api.tickets.getTicketTiers, { eventId: event._id });

    // --- Upload Handler ---
    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const postUrl = await generateUploadUrl();
            const result = await fetch(postUrl, {
                method: "POST",
                headers: { "Content-Type": file.type },
                body: file,
            });
            const { storageId } = await result.json();

            // We need the Public URL to display it in Konva
            // For now, we update the event immediately to get the URL via a re-fetch or optimistically?
            // A better way is to get the URL from storageId via a query, but let's just update the event for simplicity in this MVP.
            await updateEvent({
                id: event._id,
                seatMapConfig: {
                    imageUrl: "",
                    storageId: storageId,
                    zones: zones
                }
            });

            // Refetch or invalidation happens automatically.
            toast.success("Map uploaded! Refreshing...");
            // Ideally we get the URL back. 
        } catch (error) {
            console.error(error);
            toast.error("Upload failed");
        } finally {
            setIsUploading(false);
        }
    };

    // --- Zone Management ---
    const addZone = () => {
        const newZone = {
            id: `zone-${Date.now()}`,
            x: 100,
            y: 100,
            width: 100,
            height: 100,
            shape: 'rect',
            name: 'New Zone',
            color: '#D4AF37',
            price: 0,
            rotation: 0
        };
        setZones([...zones, newZone]);
        setSelectedId(newZone.id);
    };

    const updateZone = (id, newAttrs) => {
        setZones(zones.map(z => z.id === id ? { ...z, ...newAttrs } : z));
    };

    const deleteZone = () => {
        if (selectedId) {
            setZones(zones.filter(z => z.id !== selectedId));
            setSelectedId(null);
        }
    };

    // --- Saving ---
    const handleSave = async () => {
        try {
            // We need the image URL. Using the event's current image URL for now.
            // If we just uploaded, we rely on the event update from upload.
            await updateEvent({
                id: event._id,
                seatMapConfig: {
                    imageUrl: event.seatMapConfig?.imageUrl || mapUrl, // Keep existing or use state
                    storageId: event.seatMapConfig?.storageId,
                    zones: zones.map(z => ({
                        id: z.id,
                        name: z.name,
                        color: z.color,
                        price: Number(z.price),
                        x: z.x,
                        y: z.y,
                        width: z.width * (z.scaleX || 1), // Bake scale into width
                        height: z.height * (z.scaleY || 1),
                        shape: z.shape,
                        rotation: z.rotation
                    }))
                }
            });
            toast.success("Seating configuration saved!");
        } catch (e) {
            console.error(e);
            toast.error("Failed to save configuration");
        }
    };

    // --- Transformer Logic ---
    useEffect(() => {
        if (selectedId && transformerRef.current) {
            const node = stageRef.current.findOne('#' + selectedId);
            if (node) {
                transformerRef.current.nodes([node]);
                transformerRef.current.getLayer().batchDraw();
            }
        }
    }, [selectedId, zones]);

    // Handle selection clearing
    const checkDeselect = (e) => {
        const clickedOnEmpty = e.target === e.target.getStage();
        if (clickedOnEmpty) {
            setSelectedId(null);
            transformerRef.current?.nodes([]);
        }
    };

    const selectedZone = zones.find(z => z.id === selectedId);

    // --- Image Loading Handler ---
    const handleImageLoaded = (size) => {
        if (size.width !== stageSize.width || size.height !== stageSize.height) {
            setStageSize(size);
            setImageSize(size);
        }
    };

    const handleRemoveMap = async () => {
        try {
            await updateEvent({
                id: event._id,
                seatMapConfig: {
                    imageUrl: "",
                    zones: zones // Maintain zones
                }
            });
            setMapUrl(null);
            toast.success("Map removed");
        } catch (error) {
            console.error(error);
            toast.error("Failed to remove map");
        }
    };
    return (
        <div className="flex h-full bg-[#111]">
            {/* Sidebar Controls */}
            <div className="w-80 bg-[#181611] border-r border-white/10 p-6 flex flex-col gap-6 overflow-y-auto">
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-white font-bold">Venue Map</h3>
                        {event.seatMapConfig?.imageUrl && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleRemoveMap}
                                className="h-8 text-red-400 hover:text-red-300 hover:bg-red-900/20 px-2"
                            >
                                <Trash2 className="w-4 h-4 mr-1" /> Remove
                            </Button>
                        )}
                    </div>
                    <div
                        className="border-2 border-dashed border-white/10 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-[#fac529]/50 transition-colors bg-white/5"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <Upload className="w-8 h-8 text-white/50 mb-2" />
                        <span className="text-xs text-white/50">{event.seatMapConfig?.imageUrl ? "Change map" : "Click to upload map"}</span>
                        <input
                            type="file"
                            ref={fileInputRef}
                            hidden
                            accept="image/png, image/jpeg, image/svg+xml"
                            onChange={handleFileUpload}
                        />
                    </div>
                </div>

                <div className="flex-1">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-white font-bold">Zones</h3>
                        <Button size="sm" variant="outline" onClick={addZone} className="h-8 border-white/10 text-white hover:bg-white/10">
                            <Plus className="w-4 h-4 mr-1" /> Add
                        </Button>
                    </div>

                    {selectedZone ? (
                        <div className="space-y-4 animate-in slide-in-from-left-5">
                            <div className="space-y-2">
                                <Label className="text-white/70">Zone Name</Label>
                                <Input
                                    value={selectedZone.name}
                                    onChange={(e) => updateZone(selectedId, { name: e.target.value })}
                                    className="bg-white/5 border-white/10 text-white"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-white/70">Ticket Tier</Label>
                                <Select
                                    value={ticketTiers?.find(t => t.price === selectedZone.price)?.id || "custom"}
                                    onValueChange={(val) => {
                                        const tier = ticketTiers?.find(t => t._id === val);
                                        if (tier) {
                                            updateZone(selectedId, {
                                                name: tier.name,
                                                price: tier.price,
                                                color: tier.color || selectedZone.color
                                            });
                                        }
                                    }}
                                >
                                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                                        <SelectValue placeholder="Link to Ticket Tier" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {ticketTiers?.map(t => (
                                            <SelectItem key={t._id} value={t._id}>
                                                {t.name} (${t.price})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-white/70">Price Override ($)</Label>
                                <Input
                                    type="number"
                                    value={isNaN(selectedZone.price) ? "" : selectedZone.price}
                                    onChange={(e) => {
                                        const val = parseFloat(e.target.value);
                                        updateZone(selectedId, { price: isNaN(val) ? 0 : val });
                                    }}
                                    className="bg-white/5 border-white/10 text-white"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-white/70">Color</Label>
                                <div className="flex gap-2">
                                    {['#D4AF37', '#A855F7', '#3B82F6', '#EF4444', '#10B981'].map(color => (
                                        <div
                                            key={color}
                                            className={`w-6 h-6 rounded-full cursor-pointer ring-2 ring-offset-2 ring-offset-[#181611] ${selectedZone.color === color ? 'ring-white' : 'ring-transparent'}`}
                                            style={{ backgroundColor: color }}
                                            onClick={() => updateZone(selectedId, { color })}
                                        />
                                    ))}
                                </div>
                            </div>

                            <Button
                                variant="destructive"
                                className="w-full mt-4"
                                onClick={deleteZone}
                            >
                                <Trash2 className="w-4 h-4 mr-2" /> Delete Zone
                            </Button>
                        </div>
                    ) : (
                        <div className="text-white/30 text-sm text-center py-10 border border-white/5 rounded-xl bg-white/[0.02]">
                            Select a zone to edit details
                        </div>
                    )}
                </div>

                <Button className="w-full bg-[#fac529] text-black font-bold hover:bg-[#eab308]" onClick={handleSave}>
                    <Save className="w-4 h-4 mr-2" /> Save Changes
                </Button>
            </div>

            {/* Canvas Area */}
            <div className="flex-1 bg-[#0a0a0a] relative overflow-hidden flex items-center justify-center p-10">
                <div className="shadow-2xl border border-white/10 bg-[#111]">
                    <Stage
                        width={stageSize.width}
                        height={stageSize.height}
                        onMouseDown={checkDeselect}
                        onTouchStart={checkDeselect}
                        ref={stageRef}
                    >
                        <Layer>
                            {/* Background Image */}
                            {mapUrl && (
                                <URLImage
                                    src={mapUrl}
                                    onLoaded={handleImageLoaded}
                                />
                            )}
                        </Layer>

                        <Layer>
                            {!mapUrl && (
                                <Text text="Upload a map to begin" x={300} y={100} fill="white" fontSize={20} />
                            )}
                            {/* Zones */}
                            {zones.map((zone) => (
                                <Group
                                    key={zone.id}
                                    id={zone.id}
                                    x={zone.x}
                                    y={zone.y}
                                    draggable
                                    onDragEnd={(e) => {
                                        updateZone(zone.id, {
                                            x: e.target.x(),
                                            y: e.target.y(),
                                        });
                                    }}
                                    onClick={() => setSelectedId(zone.id)}
                                    onTap={() => setSelectedId(zone.id)}
                                >
                                    {zone.shape === 'rect' && (
                                        <Rect
                                            width={zone.width}
                                            height={zone.height}
                                            fill={`${zone.color}40`} // 25% opacity
                                            stroke={zone.color}
                                            strokeWidth={selectedId === zone.id ? 2 : 1}
                                            cornerRadius={8}
                                        />
                                    )}
                                    {zone.shape === 'circle' && (
                                        <Circle
                                            width={zone.width}
                                            height={zone.height}
                                            fill={`${zone.color}40`}
                                            stroke={zone.color}
                                            strokeWidth={selectedId === zone.id ? 2 : 1}
                                        />
                                    )}
                                    {/* Label */}
                                    <Text
                                        text={zone.name}
                                        fill="white"
                                        fontSize={14}
                                        fontStyle="bold"
                                        width={zone.width}
                                        align="center"
                                        y={zone.height / 2 - 7}
                                    />
                                </Group>
                            ))}

                            {/* Transformer */}
                            <Transformer
                                ref={transformerRef}
                                boundBoxFunc={(oldBox, newBox) => {
                                    // Limit resize
                                    if (newBox.width < 30 || newBox.height < 30) {
                                        return oldBox;
                                    }
                                    return newBox;
                                }}
                            />
                        </Layer>
                    </Stage>
                </div>

                <div className="absolute top-6 left-6 bg-black/50 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 text-xs text-white/50">
                    <MousePointer2 className="w-3 h-3 inline mr-2" />
                    Drag to move • Click to select
                </div>
            </div>
        </div>
    );
}

